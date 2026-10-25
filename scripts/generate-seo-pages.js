const fs = require("fs");
const path = require("path");
const categories = require("../src/data/categories.json");
const outputDirectory = path.join(__dirname, "..", "docs");
const homePagePath = path.join(outputDirectory, "index.html");
const siteRoot = "https://dipeshsukhia.github.io/news";
const homePage = fs.readFileSync(homePagePath, "utf8");
const urls = [`${siteRoot}/`];

const escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const replaceMeta = (html, attribute, key, value) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(<meta\\s+${attribute}="${escapedKey}"\\s+content=")[^"]*("\\s*/?>)`);
  return html.replace(pattern, `$1${escapeHtml(value)}$2`);
};

for (const category of categories) {
  const titleCase = category.charAt(0).toUpperCase() + category.slice(1);
  const title = `${titleCase} News from India | Top News`;
  const description = `Explore recent ${category} headlines from India, with stories selected for Top News readers.`;
  const url = `${siteRoot}/${category}/`;
  urls.push(url);

  let html = homePage.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = replaceMeta(html, "name", "description", description);
  html = replaceMeta(html, "property", "og:title", title);
  html = replaceMeta(html, "property", "og:description", description);
  html = replaceMeta(html, "property", "og:url", url);
  html = replaceMeta(html, "name", "twitter:title", title);
  html = replaceMeta(html, "name", "twitter:description", description);
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?\s*>/,
    `<link rel="canonical" href="${url}" />`
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    name: title,
    description,
    url,
    isPartOf: { "@id": `${siteRoot}/#website` },
    about: { "@type": "Thing", name: `India ${category} news` },
    inLanguage: "en",
  };
  html = html.replace(
    "</head>",
    `  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>\n  </head>`
  );

  const categoryDirectory = path.join(outputDirectory, category);
  fs.mkdirSync(categoryDirectory, { recursive: true });
  fs.writeFileSync(path.join(categoryDirectory, "index.html"), html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((url) => `  <url><loc>${url}</loc></url>`)
  .join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(outputDirectory, "sitemap.xml"), sitemap);
