"""
Fetch news from NewsAPI and maintain rolling JSON caches on disk.

Each output file stores at least 100 unique articles when enough data exists,
up to 1000, preferring the last 7 days. If the 7-day window has fewer
than 100 articles, the retention window expands until the minimum is met
or all stored articles are used. Newest articles stay on top.
"""

import json
import os
import sys
from datetime import datetime, timedelta, timezone

import requests

if len(sys.argv) != 2:
    print("Usage: python fetch_news.py api_key")
    sys.exit(1)

api_key = sys.argv[1]

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DATA_PATH = "./docs/data/"
LANGUAGE = "en"

# Preferred rolling window — articles newer than this are kept first.
RETENTION_DAYS = 7

# Minimum unique articles to keep per file when enough data exists.
MIN_ARTICLES = 100

# Maximum unique articles stored per file after merge.
MAX_ARTICLES = 1000

# NewsAPI pageSize per request (API max is 100; call count stays unchanged).
API_PAGE_SIZE = 100

CATEGORIES = [
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology",
]

COUNTRIES = [
    "in",
    "us",
]

EVERYTHING_FILE = f"{DATA_PATH}everything-{LANGUAGE}-news.json"
TOP_HEADLINES_URL = "https://newsapi.org/v2/top-headlines"
EVERYTHING_URL = "https://newsapi.org/v2/everything"


# ---------------------------------------------------------------------------
# Article helpers
# ---------------------------------------------------------------------------

def parse_published_at(article):
    """Parse NewsAPI publishedAt into a timezone-aware UTC datetime."""
    raw_value = article.get("publishedAt")
    if not raw_value:
        return None

    try:
        normalized = raw_value.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except (TypeError, ValueError):
        return None


def article_identity(article):
    """
    Build a stable identity for deduplication within a category file.
    URL is preferred; title is used only when URL is missing.
    """
    url = (article.get("url") or "").strip().lower()
    if url:
        return f"url:{url}"

    title = (article.get("title") or "").strip().lower()
    return f"title:{title}"


def is_valid_article(article):
    """Skip malformed entries and NewsAPI placeholder rows."""
    if not isinstance(article, dict):
        return False

    title = (article.get("title") or "").strip().lower()
    if not title or title == "[removed]":
        return False

    return bool(article_identity(article))


def is_within_retention(article, cutoff):
    """Return True when the article falls inside the rolling retention window."""
    published_at = parse_published_at(article)
    if published_at is None:
        # Keep articles without a date rather than silently dropping history.
        return True
    return published_at >= cutoff


# ---------------------------------------------------------------------------
# Merge / persist logic
# ---------------------------------------------------------------------------

def load_existing_articles(file_path):
    """Load previously saved articles from disk, if the file exists."""
    if not os.path.exists(file_path):
        return []

    try:
        with open(file_path, encoding="utf-8") as json_file:
            payload = json.load(json_file)
    except (OSError, json.JSONDecodeError) as error:
        print(f"Could not read {file_path}: {error}")
        return []

    articles = payload.get("articles")
    if not isinstance(articles, list):
        return []

    return [article for article in articles if is_valid_article(article)]


def dedupe_articles(existing_articles, new_articles):
    """Merge article lists and deduplicate by URL/title within one file."""
    merged_by_identity = {}

    for article in existing_articles + new_articles:
        if not is_valid_article(article):
            continue

        identity = article_identity(article)
        current = merged_by_identity.get(identity)
        if current is None:
            merged_by_identity[identity] = article
            continue

        # When duplicates exist, keep the copy with the newer publish time.
        current_time = parse_published_at(current)
        incoming_time = parse_published_at(article)
        if incoming_time and (not current_time or incoming_time > current_time):
            merged_by_identity[identity] = article

    deduped = list(merged_by_identity.values())
    deduped.sort(
        key=lambda article: parse_published_at(article) or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )
    return deduped


def filter_by_retention_days(articles, retention_days):
    """Return articles inside a rolling window measured in days from now."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)
    return [article for article in articles if is_within_retention(article, cutoff)]


def select_articles_for_storage(existing_articles, new_articles):
    """
    Pick articles to store for one file.

    Rules:
    - Deduplicate within this file
    - Prefer the last RETENTION_DAYS window
    - Expand the window day-by-day until MIN_ARTICLES is met
    - Sort newest first
    - Cap at MAX_ARTICLES
    """
    deduped = dedupe_articles(existing_articles, new_articles)
    if not deduped:
        return []

    # Prefer 7 days; widen only when we cannot reach the minimum yet.
    for retention_days in range(RETENTION_DAYS, 366):
        windowed = filter_by_retention_days(deduped, retention_days)
        if len(windowed) >= MIN_ARTICLES:
            return windowed[:MAX_ARTICLES]
        if len(windowed) == len(deduped):
            break

    return deduped[:MAX_ARTICLES]


def build_payload(articles):
    """Build the JSON shape expected by the frontend."""
    return {
        "status": "ok",
        "totalResults": len(articles),
        "articles": articles,
    }


def save_payload(file_path, payload):
    """Write merged payload to disk."""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as json_file:
        json.dump(payload, json_file, ensure_ascii=False, indent=4)


def merge_and_save(file_path, api_payload=None):
    """
    Merge API data with existing file data and persist the rolling window.

    When the API returns no articles, existing data is still merged,
    deduplicated, and re-sorted using the min/max article rules.
    """
    existing_articles = load_existing_articles(file_path)
    new_articles = []

    if isinstance(api_payload, dict) and api_payload.get("status") == "ok":
        fetched = api_payload.get("articles")
        if isinstance(fetched, list):
            new_articles = fetched

    merged_articles = select_articles_for_storage(existing_articles, new_articles)

    if not merged_articles:
        if existing_articles:
            save_payload(file_path, build_payload([]))
            print(f"No articles left for {file_path}; saved empty cache")
        elif os.path.exists(file_path):
            print(f"No articles for {file_path}; kept existing file unchanged")
        else:
            print(f"No articles available to create {file_path}; skipped save")
        return

    save_payload(file_path, build_payload(merged_articles))

    added_count = max(0, len(merged_articles) - len(existing_articles))
    print(
        f"Saved {len(merged_articles)} unique articles to {file_path} "
        f"(added/updated ~{added_count}, min={MIN_ARTICLES}, max={MAX_ARTICLES})"
    )


def fetch_json(url, params):
    """Perform one NewsAPI request and return parsed JSON or None."""
    response = requests.get(url, params=params, timeout=30)

    if response.status_code != 200:
        print(f"Request failed ({response.status_code}) for {url} with params {params}")
        return None

    try:
        return response.json()
    except json.JSONDecodeError:
        print(f"Invalid JSON response from {url}")
        return None


# ---------------------------------------------------------------------------
# API calls (count unchanged: 1 everything + 14 top-headlines)
# ---------------------------------------------------------------------------

os.makedirs(DATA_PATH, exist_ok=True)

# 1) Everything endpoint — general English news feed
everything_params = {
    "apiKey": api_key,
    "q": "news",
    "sortBy": "publishedAt",
    "language": LANGUAGE,
    "pageSize": API_PAGE_SIZE,
}

everything_payload = fetch_json(EVERYTHING_URL, everything_params)
merge_and_save(EVERYTHING_FILE, everything_payload)

# 2) Top-headlines endpoint — country/category feeds
for country in COUNTRIES:
    for category in CATEGORIES:
        headline_params = {
            "apiKey": api_key,
            "country": country,
            "category": category,
            "language": LANGUAGE,
            "pageSize": API_PAGE_SIZE,
        }

        file_path = f"{DATA_PATH}{country}-{LANGUAGE}-{category}.json"
        headline_payload = fetch_json(TOP_HEADLINES_URL, headline_params)
        merge_and_save(file_path, headline_payload)
