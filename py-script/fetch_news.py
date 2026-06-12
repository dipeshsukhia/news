import os
import requests
import json
import sys

if len(sys.argv) != 2:
    print("Usage: python newsapi.py api_key")
    sys.exit(1)

api_key = sys.argv[1]

data_path = './docs/data/'
os.makedirs(data_path, exist_ok=True)

language = 'en'


def has_news_data(data):
    if not isinstance(data, dict) or data.get('status') != 'ok':
        return False
    articles = data.get('articles')
    return isinstance(articles, list) and len(articles) > 0


def save_news_data(file_path, data):
    if not has_news_data(data):
        if os.path.exists(file_path):
            print(f"No new articles for {file_path}; kept existing data")
        else:
            print(f"No articles returned and no existing file at {file_path}; skipped save")
        return

    with open(file_path, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)

    print(f"News data has been saved to {file_path}")


# Specify the endpoint URL for the everything News API
url = f'https://newsapi.org/v2/everything'
# Define the parameters for your news query (e.g., source, country, category)
params = {
    'apiKey': api_key,
    'q': 'news',
    'sortBy' : 'publishedAt',
    'language' : language,
    'pageSize' : 100
}

# Make the API request
response = requests.get(url, params=params)

if response.status_code == 200:
    file_path = data_path + 'everything-' + language + '-news.json'
    save_news_data(file_path, response.json())
else:
    file_path = data_path + 'everything-' + language + '-news.json'
    if os.path.exists(file_path):
        print(f"Failed to fetch news (status {response.status_code}); kept existing data at {file_path}")
    else:
        print(f"Failed to fetch news. Status code: {response.status_code}")


categories = [
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology"
];
countries = [
    "in",
    "us",
];

# Specify the endpoint URL for the News API
url = f'https://newsapi.org/v2/top-headlines'


for country in countries:
    for category in categories:
        # Define the parameters for your news query (e.g., source, country, category)
        params = {
            'apiKey': api_key,
            'country': country,  # Change this to your desired country
            'category': category,  # Change this to your desired category
            'language' : language,
            'pageSize' : 100
        }

        # Make the API request
        response = requests.get(url, params=params)

        file_path = data_path + country + '-' + language + '-' + category + '.json'

        if response.status_code == 200:
            save_news_data(file_path, response.json())
        elif os.path.exists(file_path):
            print(f"Failed to fetch news for {country}/{category} (status {response.status_code}); kept existing data at {file_path}")
        else:
            print(f"Failed to fetch news for {country}/{category}. Status code: {response.status_code}")
