// Gera public/sitemap.xml e robots.txt antes do build.
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://levillepet.com.br";

const entries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/hotelzinho", changefreq: "weekly", priority: "0.9" },
  { path: "/transporte", changefreq: "weekly", priority: "0.9" },
  { path: "/venha-nos-conhecer", changefreq: "monthly", priority: "0.8" },
  { path: "/localizacao", changefreq: "monthly", priority: "0.8" },
  { path: "/fale-conosco", changefreq: "monthly", priority: "0.8" },
  { path: "/fotos", changefreq: "weekly", priority: "0.7" },
  { path: "/videos", changefreq: "weekly", priority: "0.7" },
  { path: "/albuns", changefreq: "weekly", priority: "0.7" },
  { path: "/siga-nos", changefreq: "monthly", priority: "0.6" },
];

function generateSitemap(list) {
  const urls = list.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);

const robots = [
  "User-agent: Googlebot",
  "Allow: /",
  "",
  "User-agent: Bingbot",
  "Allow: /",
  "",
  "User-agent: Twitterbot",
  "Allow: /",
  "",
  "User-agent: facebookexternalhit",
  "Allow: /",
  "",
  "User-agent: *",
  "Allow: /",
  "Disallow: /admin",
  "Disallow: /manutencao",
  "",
  `Sitemap: ${BASE_URL}/sitemap.xml`,
  "",
].join("\n");

writeFileSync(resolve("public/robots.txt"), robots);
console.log("robots.txt written");
