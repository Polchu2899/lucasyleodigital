// Genera una página estática por artículo publicado en Firestore (blog_posts)
// para que Google pueda indexarlos: /blog/<slug>/index.html, listado
// prerenderizado en /blog/ y entradas en sitemap.xml.
// Uso: node scripts/build-blog.mjs   (sin dependencias, Node 20+)
// Si BLOG_CHANGED_FILE está definida, escribe ahí las URL nuevas o modificadas.

import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = "https://www.lucasyleodigital.com";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_DIR = path.join(ROOT, "blog");
const GENERATED = "<!-- generado por scripts/build-blog.mjs: no editar a mano -->";
const MIN_TEXT_CHARS = 300;
const FIREBASE = {
  apiKey: "AIzaSyAf5cYK5vRUtfZ2RikRSu5qjqUAJHMhLiM",
  authDomain: "reservify-lucasyleo.firebaseapp.com",
  projectId: "reservify-lucasyleo",
  storageBucket: "reservify-lucasyleo.firebasestorage.app",
  messagingSenderId: "464767738256",
  appId: "1:464767738256:web:c0692dc6ba98d162101315",
};
const CATS = {
  "estrategia-digital": "Estrategia Digital",
  "seo-local": "SEO Local",
  "redes-sociales": "Redes Sociales",
  "publicidad-online": "Publicidad Online",
  "automatizacion-ia": "Automatización e IA",
  "casos-exito": "Casos de Éxito",
  "consejos-pymes": "Consejos para Pymes",
};
const DEFAULT_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FKOP4qekO2PcHMvwDZsL7FS5fK5f1%2Flogo_sin_fondo__1e540d5a.png?alt=media&token=b832e7f3-ed17-49d7-995f-d8e9ce77d53a";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function decode(v) {
  if (!v) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue.values ?? []).map(decode);
  if ("mapValue" in v) return Object.fromEntries(Object.entries(v.mapValue.fields ?? {}).map(([k, x]) => [k, decode(x)]));
  return null;
}

async function fetchPosts() {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents:runQuery?key=${FIREBASE.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "blog_posts" }],
        where: { fieldFilter: { field: { fieldPath: "status" }, op: "EQUAL", value: { stringValue: "published" } } },
      },
    }),
  });
  if (!res.ok) throw new Error(`Firestore respondió ${res.status}: ${await res.text()}`);
  const rows = await res.json();
  return rows
    .filter((r) => r.document)
    .map((r) => {
      const f = Object.fromEntries(Object.entries(r.document.fields ?? {}).map(([k, v]) => [k, decode(v)]));
      return { id: r.document.name.split("/").pop(), ...f };
    })
    .filter((p) => {
      const ok = typeof p.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug);
      if (!ok) console.warn(`Saltado: slug no válido en "${p.title}" (${p.slug})`);
      return ok;
    })
    .map((p) => ({
      ...p,
      published: new Date(p.publishedAt ?? p.createdAt ?? Date.now()),
      updated: new Date(p.updatedAt ?? p.publishedAt ?? p.createdAt ?? Date.now()),
      textLength: String(p.content ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().length,
    }))
    .sort((a, b) => b.published - a.published);
}

function replaceBetween(html, name, content) {
  const start = `<!-- BLOG:${name}:START -->`;
  const end = `<!-- BLOG:${name}:END -->`;
  const i = html.indexOf(start);
  const j = html.indexOf(end);
  if (i === -1 || j === -1 || j < i) throw new Error(`Faltan los marcadores BLOG:${name} en la plantilla`);
  return html.slice(0, i + start.length) + "\n" + content + "\n" + html.slice(j);
}

const dateEs = (d) => d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });
const isoDay = (d) => d.toISOString().slice(0, 10);
const postUrl = (p) => `${SITE}/blog/${p.slug}/`;
const description = (p) => p.seoDescription || p.excerpt || "";
const indexable = (p) => p.textLength >= MIN_TEXT_CHARS;

const NOIMG =
  '<div class="bc-noimg"><svg width="48" height="48" stroke="rgba(200,117,51,0.3)" fill="none" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>';

function card(p) {
  return (
    `<a class="blog-card" href="/blog/${p.slug}/">` +
    (p.coverImage
      ? `<img src="${esc(p.coverImage)}" alt="${esc(p.title)}" loading="lazy" decoding="async" width="400" height="200">`
      : NOIMG) +
    `<div class="bc-body"><div class="bc-cat">${esc(CATS[p.category] ?? p.category ?? "")}</div>` +
    `<div class="bc-title">${esc(p.title)}</div><div class="bc-excerpt">${esc(p.excerpt)}</div>` +
    `<div class="bc-meta"><span>${dateEs(p.published)}</span><span>${esc(p.readTime ?? 1)} min de lectura</span></div></div></a>`
  );
}

function setMeta(html, attr, key, value) {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*">`);
  const tag = `<meta ${attr}="${key}" content="${esc(value)}">`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `${tag}\n</head>`);
}

function articlePage(template, p, related) {
  const url = postUrl(p);
  const base = p.seoTitle || p.title;
  const title = /lucas y leo/i.test(base) ? base : `${base} | Lucas y Leo Digital`;
  const image = p.coverImage || DEFAULT_IMAGE;
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = setMeta(html, "name", "description", description(p));
  html = setMeta(html, "name", "author", `${p.author || "Lucas"} — Lucas y Leo Digital`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">`);
  html = html.replace(/<link rel="alternate" hreflang="(es|x-default)" href="[^"]*">/g, (_m, lang) => `<link rel="alternate" hreflang="${lang}" href="${url}">`);
  html = setMeta(html, "property", "og:type", "article");
  html = setMeta(html, "property", "og:title", p.seoTitle || p.title);
  html = setMeta(html, "property", "og:description", description(p));
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "property", "og:image", image);
  html = setMeta(html, "property", "article:published_time", p.published.toISOString());
  html = setMeta(html, "property", "article:modified_time", p.updated.toISOString());
  if (!indexable(p)) html = setMeta(html, "name", "robots", "noindex, follow");

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: p.title,
        description: description(p),
        image,
        datePublished: p.published.toISOString(),
        dateModified: p.updated.toISOString(),
        author: { "@type": "Person", name: p.author || "Lucas", url: `${SITE}/` },
        publisher: { "@type": "Organization", name: "Lucas y Leo Digital", url: `${SITE}/`, logo: { "@type": "ImageObject", url: DEFAULT_IMAGE } },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        inLanguage: "es",
        ...(p.tags?.length ? { keywords: p.tags.join(", ") } : {}),
        ...(p.category ? { articleSection: CATS[p.category] ?? p.category } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog/` },
          { "@type": "ListItem", position: 3, name: p.title, item: url },
        ],
      },
    ],
  };
  html = replaceBetween(
    html,
    "SCHEMA",
    `<script type="application/ld+json">\n${JSON.stringify(schema).replace(/</g, "\\u003c")}\n</script>`,
  );

  html = replaceBetween(html, "LIST", "");
  html = replaceBetween(html, "STATIC", "");
  const tags = p.tags?.length ? `<div class="bs-tags">${p.tags.map((t) => `<span class="bs-tag">${esc(t)}</span>`).join("")}</div>` : "";
  html = replaceBetween(
    html,
    "SINGLE",
    `<main class="blog-single active" id="blog-single">
  <article class="container">
    <nav aria-label="Ruta"><a class="bs-back" href="/blog/"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg> Volver al blog</a></nav>
    <div class="bs-cat">${esc(CATS[p.category] ?? p.category ?? "")}</div>
    <h1 class="bs-title">${esc(p.title)}</h1>
    <div class="bs-meta"><span>Por ${esc(p.author || "Lucas")}</span><time datetime="${p.published.toISOString()}">${dateEs(p.published)}</time><span>${esc(p.readTime ?? 1)} min de lectura</span></div>
    ${tags}
    ${p.coverImage ? `<img class="bs-cover" src="${esc(p.coverImage)}" alt="${esc(p.title)}" width="1080" height="450" fetchpriority="high">` : ""}
    <div class="bs-content">${String(p.content ?? "").replace(/<img(?![^>]*\balt=)/gi, `<img alt="${esc(p.title)}"`)}</div>
    <div class="bs-cta"><p>¿Quieres aplicar esto en tu negocio? Te ayudamos en una sesión gratuita.</p><a href="/#sesion">Reservar sesión gratuita</a></div>
  </article>
  ${related.length ? `<section class="bs-related container" aria-label="Más artículos"><h2>Sigue leyendo</h2><div class="blog-grid">${related.map(card).join("")}</div></section>` : ""}
</main>`,
  );

  html = replaceBetween(
    html,
    "SCRIPT",
    `<script type="module">
(async function(){
  var id = ${JSON.stringify(p.id)}, slug = ${JSON.stringify(p.slug)}, key = 'blog_read_' + id;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    const appMod = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    const fs = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const db = fs.getFirestore(appMod.initializeApp(${JSON.stringify(FIREBASE)}, 'blog-post'));
    await fs.updateDoc(fs.doc(db, 'blog_posts', id), { viewCount: fs.increment(1) });
    await fs.addDoc(fs.collection(db, 'blog_reads'), { postId: id, postSlug: slug, timestamp: fs.serverTimestamp() });
  } catch (e) { console.warn('View tracking failed:', e); }
})();
</script>`,
  );

  return html.replace("<head>", `<head>\n${GENERATED}`);
}

const HOMES = [
  { file: "index.html", locale: "es-ES", cats: CATS },
  {
    file: "en/index.html",
    locale: "en-GB",
    cats: {
      "estrategia-digital": "Digital Strategy", "seo-local": "Local SEO", "redes-sociales": "Social Media",
      "publicidad-online": "Online Advertising", "automatizacion-ia": "Automation &amp; AI",
      "casos-exito": "Success Stories", "consejos-pymes": "Tips for SMEs",
    },
  },
  {
    file: "ca/index.html",
    locale: "ca-ES",
    cats: {
      "estrategia-digital": "Estratègia Digital", "seo-local": "SEO Local", "redes-sociales": "Xarxes Socials",
      "publicidad-online": "Publicitat Online", "automatizacion-ia": "Automatització i IA",
      "casos-exito": "Casos d'Èxit", "consejos-pymes": "Consells per a Pimes",
    },
  },
];

// Misma tarjeta que pinta el JavaScript de la portada, pero en el HTML para que Google vea el enlace.
function homeCard(p, home) {
  const date = p.published.toLocaleDateString(home.locale, { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });
  const img = p.coverImage
    ? `<img src="${esc(p.coverImage)}" alt="${esc(p.title)}" loading="lazy" decoding="async" width="400" height="200">`
    : '<div class="bpc-no-img"></div>';
  return (
    `<a class="blog-post-card" href="/blog/${p.slug}/">${img}<div class="bpc-body">` +
    `<div class="bpc-cat">${home.cats[p.category] ?? esc(p.category ?? "")}</div>` +
    `<div class="bpc-title">${esc(p.title)}</div><div class="bpc-excerpt">${esc(p.excerpt)}</div>` +
    `<div class="bpc-meta"><span><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> ${date}</span>` +
    `<span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> ${esc(p.readTime ?? 1)} min</span></div></div></a>`
  );
}

function rssFeed(posts) {
  const items = posts.filter(indexable).slice(0, 20);
  const last = items.reduce((m, p) => (p.updated > m ? p.updated : m), items[0]?.updated ?? new Date(0));
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Blog de Lucas y Leo Digital</title>
  <link>${SITE}/blog/</link>
  <atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
  <description>Artículos prácticos sobre estrategia digital, SEO, automatización e IA para pymes.</description>
  <language>es-ES</language>
  <lastBuildDate>${last.toUTCString()}</lastBuildDate>
${items
  .map(
    (p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${postUrl(p)}</link>
    <guid isPermaLink="true">${postUrl(p)}</guid>
    <pubDate>${p.published.toUTCString()}</pubDate>
    <description>${esc(description(p))}</description>${p.category ? `\n    <category>${esc(CATS[p.category] ?? p.category)}</category>` : ""}
  </item>`,
  )
  .join("\n")}
</channel>
</rss>
`;
}

function sitemapBlock(posts) {
  return posts
    .filter(indexable)
    .map(
      (p) =>
        `  <url>\n    <loc>${postUrl(p)}</loc>\n    <lastmod>${isoDay(p.updated)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    )
    .join("\n");
}

async function writeIfChanged(file, content, changed, url) {
  const before = existsSync(file) ? await readFile(file, "utf8") : null;
  if (before === content) return;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
  if (url) changed.add(url);
  console.log(`Actualizado ${path.relative(ROOT, file)}`);
}

async function main() {
  const posts = await fetchPosts();
  console.log(`${posts.length} artículo(s) publicados`);
  for (const p of posts.filter((x) => !indexable(x))) {
    console.warn(`Aviso: "${p.title}" tiene solo ${p.textLength} caracteres de texto; se publica con noindex y fuera del sitemap.`);
  }

  const indexFile = path.join(BLOG_DIR, "index.html");
  const template = await readFile(indexFile, "utf8");
  const changed = new Set();

  for (const p of posts) {
    const related = posts.filter((x) => x.slug !== p.slug && indexable(x)).slice(0, 3);
    await writeIfChanged(path.join(BLOG_DIR, p.slug, "index.html"), articlePage(template, p, related), changed, postUrl(p));
  }

  // Borrar páginas de artículos que ya no están publicados.
  const live = new Set(posts.map((p) => p.slug));
  for (const entry of await readdir(BLOG_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || live.has(entry.name)) continue;
    const file = path.join(BLOG_DIR, entry.name, "index.html");
    if (existsSync(file) && (await readFile(file, "utf8")).includes(GENERATED)) {
      await rm(path.join(BLOG_DIR, entry.name), { recursive: true });
      console.log(`Eliminado blog/${entry.name}/ (ya no está publicado)`);
    }
  }

  let index = replaceBetween(template, "GRID", posts.length ? posts.map(card).join("\n") : '<div class="blog-loading">Cargando artículos...</div>');
  index = replaceBetween(index, "STATIC", `<script>window.__BLOG_STATIC__=${JSON.stringify(posts.map((p) => p.slug))};</script>`);
  await writeIfChanged(indexFile, index, changed, `${SITE}/blog/`);

  const sitemapFile = path.join(ROOT, "sitemap.xml");
  let sitemap = await readFile(sitemapFile, "utf8");
  if (!sitemap.includes("<!-- BLOG:POSTS:START -->")) {
    sitemap = sitemap.replace("</urlset>", "  <!-- BLOG:POSTS:START -->\n  <!-- BLOG:POSTS:END -->\n</urlset>");
  }
  sitemap = replaceBetween(sitemap, "POSTS", sitemapBlock(posts));
  const latest = posts.filter(indexable)[0];
  if (latest) {
    sitemap = sitemap.replace(
      /(<loc>https:\/\/www\.lucasyleodigital\.com\/blog\/<\/loc>\s*<lastmod>)[^<]*(<\/lastmod>)/,
      `$1${isoDay(posts.filter(indexable).reduce((m, p) => (p.updated > m ? p.updated : m), latest.updated))}$2`,
    );
  }
  await writeIfChanged(sitemapFile, sitemap, changed, null);

  await writeIfChanged(path.join(BLOG_DIR, "feed.xml"), rssFeed(posts), changed, null);

  const latestForHome = posts.filter(indexable).slice(0, 3);
  for (const home of HOMES) {
    const file = path.join(ROOT, home.file);
    let html = await readFile(file, "utf8");
    if (latestForHome.length) html = replaceBetween(html, "HOME", latestForHome.map((p) => homeCard(p, home)).join("\n"));
    html = replaceBetween(html, "STATIC", `<script>window.__BLOG_STATIC__=${JSON.stringify(posts.map((p) => p.slug))};</script>`);
    if (posts.filter(indexable).length > 3) {
      html = html.replace(
        'id="blog-ver-todos" style="text-align:center;margin-top:36px;display:none;"',
        'id="blog-ver-todos" style="text-align:center;margin-top:36px;display:block;"',
      );
    }
    await writeIfChanged(file, html, changed, `${SITE}/${home.file.replace(/index\.html$/, "")}`);
  }

  if (process.env.BLOG_CHANGED_FILE) await writeFile(process.env.BLOG_CHANGED_FILE, JSON.stringify([...changed]));
  console.log(changed.size ? `${changed.size} URL nuevas o modificadas` : "Sin cambios");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
