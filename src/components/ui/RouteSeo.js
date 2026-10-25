import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCountry } from "../../context/CountryProvider";
import categories from "../../data/categories.json";

const siteUrl = "https://dipeshsukhia.github.io/news/";
const homeDescription =
  "Read current headlines across business, entertainment, general news, health, science, sports, and technology. Explore top stories from India and the United States with Top News.";

const RouteSeo = () => {
  const { pathname } = useLocation();
  const { country } = useCountry();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const category = categories.find((item) => `/${item}` === normalizedPath);
  const countryName = country === "in" ? "India" : "the United States";
  const categoryName = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : null;
  const title = categoryName
    ? `${categoryName} News from ${countryName} | Top News`
    : "Top News Headlines | Top News";
  const description = categoryName
    ? `Explore recent ${categoryName.toLowerCase()} headlines from ${countryName}, with stories selected for Top News readers.`
    : homeDescription;

  useEffect(() => {
    document.title = title;

    const setMeta = (attribute, key, content) => {
      let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    const canonicalUrl = categoryName ? siteUrl + categoryName.toLowerCase() + "/" : siteUrl;
    setMeta("property", "og:url", canonicalUrl);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    let schema = document.head.querySelector("script[data-route-seo]");
    if (!schema) {
      schema = document.createElement("script");
      schema.type = "application/ld+json";
      schema.dataset.routeSeo = "true";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": categoryName ? "CollectionPage" : "WebPage",
      name: title,
      description,
      url: canonicalUrl,
      isPartOf: { "@type": "WebSite", name: "Top News", url: siteUrl },
      ...(categoryName
        ? { about: { "@type": "Thing", name: `${countryName} ${categoryName} news` } }
        : {}),
      inLanguage: "en",
    });
  }, [title, description, categoryName, countryName]);

  return null;
};

export default RouteSeo;
