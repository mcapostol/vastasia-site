import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {content, languages} from '../src/content.mjs';
import {enrichment} from '../src/enrichment.mjs';

const root = process.argv.includes('--preview') ? 'preview_html' : 'public_html';
const expectedLanguages = ['ro', 'en', 'fr', 'de', 'es'];
const pages = [
  'index.html',
  'services.html',
  'electrical.html',
  'plumbing.html',
  'hvac.html',
  'coordination.html',
  'projects.html',
  'about.html',
  'contact.html',
  'privacy.html',
];
const servicePages = ['electrical.html', 'plumbing.html', 'hvac.html', 'coordination.html'];
const walk = directory => fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry =>
  entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)],
);
const keys = value => Object.keys(value).sort().join('|');
const decode = value => value
  .replaceAll('&amp;', '&')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'");
const plainText = value => decode(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`, 'i'));
  return match && decode(match[1]);
};
const hasType = (node, type) => (Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']]).includes(type);
const pageUrl = (base, lang, page) => `${base}/${lang === 'ro' ? '' : `${lang}/`}${page === 'index.html' ? '' : page}`;

assert.deepEqual(languages, expectedLanguages, 'The build must expose exactly the five supported languages');
for (const lang of expectedLanguages) {
  assert.equal(keys(content[lang]), keys(content.ro), `Translation keys: ${lang}`);
  assert.equal(keys(enrichment[lang]), keys(enrichment.ro), `Enrichment keys: ${lang}`);
  assert.equal(content[lang].services.length, 4, `Services: ${lang}`);
  assert.equal(content[lang].steps.length, 4, `Process steps: ${lang}`);
  assert.equal(enrichment[lang].seoTitles.length, pages.length, `SEO titles: ${lang}`);
  assert.equal(enrichment[lang].service.length, servicePages.length, `Service enrichment: ${lang}`);
  assert(enrichment[lang].generalFaq.length > 0, `General FAQ: ${lang}`);
  for (const service of content[lang].services) assert.equal(service.items.length, 3, `Service items: ${lang}`);
  for (const service of enrichment[lang].service) {
    assert.equal(service.paragraphs.length, 2, `Service paragraphs: ${lang}`);
    assert.equal(service.delivery.length, 3, `Service delivery list: ${lang}`);
    assert.equal(service.faq.length, 3, `Service FAQ: ${lang}`);
  }
}

let localReferences = 0;
const records = [];
for (const file of walk(root)) {
  if (!file.endsWith('.html')) continue;
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).split(path.sep).join('/');
  assert(
    !/CLARIFIED|site-clarified|clarified\.(?:ro|com|eu|net|io)|formsubmit\.co|G-KZYPDK2SWB|yxk3rvlwak/.test(html),
    `Foreign branding/tracking: ${file}`,
  );
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `H1: ${file}`);

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = decode(match[1]);
    if (/^(?:https?:|tel:|mailto:|data:|#)/.test(url)) continue;
    const target = path.resolve(path.dirname(file), url.split(/[?#]/)[0]);
    assert(fs.existsSync(target), `Broken reference ${file}: ${url}`);
    localReferences++;
  }

  if (relative === '404.html') continue;
  const segments = relative.split('/');
  const lang = segments.length === 1 ? 'ro' : segments[0];
  const page = segments.at(-1);
  assert(expectedLanguages.includes(lang), `Unknown language directory: ${relative}`);
  assert(pages.includes(page), `Unknown generated page: ${relative}`);
  assert.equal(attribute(html.match(/<html\b[^>]*>/i)?.[0] || '', 'lang'), lang, `HTML language: ${relative}`);
  assert.match(html, /<meta name="description" content="[^"\n]+">/, `Meta description: ${relative}`);

  const titleMatches = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
  assert.equal(titleMatches.length, 1, `One title: ${relative}`);
  const title = plainText(titleMatches[0][1]);

  const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || '';
  const robotsTags = [...head.matchAll(/<meta\b[^>]*\bname="robots"[^>]*>/gi)].map(match => match[0]);
  assert.equal(robotsTags.length, 1, `One robots meta tag: ${relative}`);
  const robotsDirective = attribute(robotsTags[0], 'content');
  if (root === 'preview_html') {
    assert.equal(robotsDirective, 'noindex,nofollow', `Preview noindex: ${relative}`);
  } else {
    assert.equal(robotsDirective, 'index,follow,max-image-preview:large,max-snippet:-1', `Production indexing: ${relative}`);
  }
  const canonicalTags = [...head.matchAll(/<link\b[^>]*\brel="canonical"[^>]*>/gi)].map(match => match[0]);
  assert.equal(canonicalTags.length, 1, `One canonical: ${relative}`);
  const canonical = attribute(canonicalTags[0], 'href');
  const canonicalUrl = new URL(canonical);
  assert.equal(canonicalUrl.protocol, 'https:', `HTTPS canonical: ${relative}`);
  assert.equal(canonicalUrl.search + canonicalUrl.hash, '', `Clean canonical: ${relative}`);

  const alternateTags = [...head.matchAll(/<link\b[^>]*\brel="alternate"[^>]*>/gi)].map(match => match[0]);
  const alternates = new Map(alternateTags.map(tag => [attribute(tag, 'hreflang'), attribute(tag, 'href')]));
  assert.equal(alternateTags.length, expectedLanguages.length + 1, `Alternate count: ${relative}`);
  assert.equal(alternates.size, expectedLanguages.length + 1, `Unique hreflang values: ${relative}`);

  const jsonMatches = [...head.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.equal(jsonMatches.length, 1, `One JSON-LD block: ${relative}`);
  let structured;
  assert.doesNotThrow(() => { structured = JSON.parse(jsonMatches[0][1]); }, `Valid JSON-LD: ${relative}`);
  assert.equal(structured['@context'], 'https://schema.org', `Schema context: ${relative}`);
  assert(Array.isArray(structured['@graph']), `JSON-LD graph: ${relative}`);

  for (const node of structured['@graph']) {
    for (const property of ['@id', 'url']) {
      if (typeof node[property] === 'string') assert.doesNotThrow(() => new URL(node[property]), `${property} URL: ${relative}`);
    }
  }
  const webPages = structured['@graph'].filter(node => hasType(node, 'WebPage'));
  assert.equal(webPages.length, 1, `WebPage schema: ${relative}`);
  assert.equal(webPages[0].url, canonical, `WebPage canonical: ${relative}`);
  assert.equal(webPages[0]['@id'], `${canonical}#webpage`, `WebPage identifier: ${relative}`);
  assert.equal(webPages[0].inLanguage, lang, `WebPage language: ${relative}`);

  const visibleFaq = [...html.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/gi)]
    .map(match => [plainText(match[1]), plainText(match[2])]);
  const faqNodes = structured['@graph'].filter(node => hasType(node, 'FAQPage'));
  assert.equal(faqNodes.length, visibleFaq.length ? 1 : 0, `FAQPage schema presence: ${relative}`);
  if (visibleFaq.length) {
    const structuredFaq = faqNodes[0].mainEntity.map(item => [item.name, item.acceptedAnswer?.text]);
    assert.deepEqual(structuredFaq, visibleFaq, `Visible FAQ must match structured FAQ: ${relative}`);
  }

  records.push({relative, lang, page, title, canonical, alternates, structured, visibleFaq});
}

assert.equal(records.length, expectedLanguages.length * pages.length, 'Exactly 50 localized pages');
const rootPage = records.find(record => record.lang === 'ro' && record.page === 'index.html');
assert(rootPage, 'Romanian home page');
const base = rootPage.canonical.replace(/\/$/, '');
assert.equal(
  base,
  root === 'preview_html' ? 'https://mcapostol.github.io/vastasia-site' : 'https://vastasia.ro',
  `${root} canonical host`,
);
for (const record of records) {
  const expectedCanonical = pageUrl(base, record.lang, record.page);
  assert.equal(record.canonical, expectedCanonical, `Canonical route: ${record.relative}`);
  for (const lang of expectedLanguages) {
    assert.equal(record.alternates.get(lang), pageUrl(base, lang, record.page), `hreflang ${lang}: ${record.relative}`);
  }
  assert.equal(record.alternates.get('x-default'), pageUrl(base, 'ro', record.page), `x-default: ${record.relative}`);
}

assert.equal(new Set(records.map(record => record.canonical)).size, records.length, 'Canonical URLs must be unique');
assert.equal(new Set(records.map(record => record.title)).size, records.length, 'Page titles must be unique across all languages');

const serviceRecords = records.filter(record => servicePages.includes(record.page));
assert.equal(serviceRecords.length, expectedLanguages.length * servicePages.length, 'Service schema must cover 20 localized pages');
for (const record of serviceRecords) {
  const services = record.structured['@graph'].filter(node => hasType(node, 'Service'));
  assert.equal(services.length, 1, `One Service schema: ${record.relative}`);
  assert.equal(services[0].url, record.canonical, `Service canonical: ${record.relative}`);
  assert.equal(services[0].mainEntityOfPage?.['@id'], `${record.canonical}#webpage`, `Service main entity: ${record.relative}`);
  assert.equal(record.visibleFaq.length, 3, `Three visible service FAQs: ${record.relative}`);
}

const sitemap = fs.readFileSync(`${root}/sitemap.xml`, 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map(match => decode(match[1].trim()));
assert.equal(sitemapUrls.length, records.length, 'Sitemap must contain exactly 50 URLs');
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, 'Sitemap URLs must be unique');
assert.deepEqual([...sitemapUrls].sort(), records.map(record => record.canonical).sort(), 'Sitemap must match every canonical URL');

const robots = fs.readFileSync(`${root}/robots.txt`, 'utf8');
if (root === 'preview_html') {
  assert.match(robots, /^User-agent: \*\nDisallow: \/\n?$/, 'Preview robots must disallow crawling');
  assert(!/Sitemap:/i.test(robots), 'Preview robots must not advertise a sitemap');
} else {
  assert.match(robots, /^User-agent: \*\nAllow: \/\nSitemap: https:\/\/vastasia\.ro\/sitemap\.xml\n?$/, 'Production robots and sitemap host');
}

for (const name of ['hero.mp4', 'hero-mobile.mp4', 'hero.webm', 'hero-poster.webp', 'logo.webp']) {
  assert(fs.statSync(`${root}/assets/${name}`).size > 1000, `Empty asset: ${name}`);
}
const app = fs.readFileSync(`${root}/assets/app.js`, 'utf8');
assert(!/formsubmit|clarity|googletagmanager|smtp-password/i.test(app), 'Client bundle must not contain tracking or mail credentials');

console.log(JSON.stringify({
  result: 'PASS',
  pages: records.length,
  serviceSchemas: serviceRecords.length,
  sitemapUrls: sitemapUrls.length,
  localReferences,
  languages,
  root,
}));
