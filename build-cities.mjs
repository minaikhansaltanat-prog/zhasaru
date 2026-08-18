// Generates the placeholder branch pages (branches/*.html) from index.html
// (the Almaty template). Re-run this any time index.html's shared sections
// (services, course, masters, testimonials, certificates, gallery, footer…)
// change, so every city page stays in sync automatically.
//
// Usage: node build-cities.mjs
//
// When a new city gets real content (address, hours, own photos), stop
// generating that file here and edit branches/<city>.html directly instead —
// or add a `custom: true` flag below and skip it in the loop.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const CITIES = [
  // custom: true = has real per-city content that index.html's template
  // does not (yet) cover — skipped here so re-running this script never
  // overwrites it. Edit branches/<city>.html directly for further changes.
  // Astana/Shymkent/Kyzylorda no longer need this: their real staff photos
  // now live in the shared Masters section in index.html itself, so a
  // normal regeneration already gives them the right content.
  // aboutPhoto: swaps the "Біз туралы" (About) section portrait for that
  // city's own specialist instead of the company founder — only set once a
  // city has a real photo of its own.
  { key: 'astana', file: 'astana.html', titleKk: 'Астана', titleRu: 'Астана',
    aboutPhoto: { src: 'assets/img/masters/gulmira-astana.jpg', alt: 'Гульмира' } },
  { key: 'kyzylorda', file: 'kyzylorda.html', titleKk: 'Қызылорда', titleRu: 'Кызылорда',
    aboutPhoto: { src: 'assets/img/masters/kuralai-kyzylorda.jpg', alt: 'Қуралай' } },
  { key: 'shymkent', file: 'shymkent.html', titleKk: 'Шымкент', titleRu: 'Шымкент',
    aboutPhoto: { src: 'assets/img/masters/shymkent-specialist.jpg', alt: 'Шымкент маманы' } },
  { key: 'aktau', file: 'aktau.html', titleKk: 'Ақтау', titleRu: 'Актау' },
  { key: 'atyrau', file: 'atyrau.html', titleKk: 'Атырау', titleRu: 'Атырау' },
  { key: 'aktobe', file: 'aktobe.html', titleKk: 'Ақтөбе', titleRu: 'Актобе' },
];

const ALMATY_CARD = `<a class="branch-card is-active" href="index.html" data-city="almaty">
        <span class="b-pin" data-i18n="branch.current">Сіз осындасыз</span>
        <span class="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
        <span class="b-city" data-i18n="branch.almaty">Алматы</span>
        <span class="b-status" data-i18n="branch.almaty.s">Ағымдағы бет</span>
      </a>`;

const ALMATY_CARD_INACTIVE = `<a class="branch-card" href="index.html" data-city="almaty">
        <span class="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
        <span class="b-city" data-i18n="branch.almaty">Алматы</span>
        <span class="b-status" data-i18n="branch.live">Жұмыс істейді</span>
      </a>`;

const HERO_BLOCK = `<span class="hero-eyebrow"><span class="dot"></span><span data-i18n="hero.eyebrow">7 филиал · Қазақстан</span></span>
    <h1 class="hero-title" data-i18n="hero.title" data-reveal>Сұлулығыңызға <em>сенім</em> артыңыз</h1>
    <p class="hero-sub" data-i18n="hero.sub" data-reveal>Zhas Aru ZR — бет күтімі мен инесіз аппараттық косметологияға арналған премиум салон желісі, сонымен қатар косметологтарға арналған авторлық оқу бағдарламасы.</p>`;

const ABOUT_IMG = `<img src="assets/img/owner.jpg" alt="Zhas Aru ZR негізін қалаушы" loading="lazy">`;

const MAP_BLOCK = `<div class="map-embed">
        <iframe src="https://maps.google.com/maps?q=%D0%90%D0%BB%D0%BC%D0%B0%D1%82%D1%8B%2C%20%D0%90%D2%9B%D1%81%D0%B0%D0%B9%201%2C%2011%2F7&t=&z=15&ie=UTF8&iwloc=&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Zhas Aru ZR — Алматы картасы"></iframe>
      </div>`;

for (const city of CITIES) {
  if (city.custom) {
    console.log('Skipped branches/' + city.file + ' (custom: true — has real content, edit it directly)');
    continue;
  }
  let out = template;

  // <title> + meta description
  out = out.replace(
    /<title>.*?<\/title>/,
    `<title>Zhas Aru ZR — ${city.titleKk} | Сұлулық салоны және оқу курсы</title>`
  );
  out = out.replace(
    /<meta name="description" content=".*?">/,
    `<meta name="description" content="Zhas Aru ZR — ${city.titleKk} филиалы жақында ашылады. Барлық сұрақтар бойынша WhatsApp немесе телефон арқылы хабарласыңыз.">`
  );

  // Almaty card becomes a normal (live, not "you are here") card.
  out = out.replace(ALMATY_CARD, ALMATY_CARD_INACTIVE);

  // Mark this city's own card as active + "you are here", keep its
  // existing "coming soon" status line underneath the badge.
  const cardRe = new RegExp(
    `<a class="branch-card" href="branches/${city.file}" data-city="${city.key}">\\s*<span class="b-icon">[\\s\\S]*?<\\/span>\\s*<span class="b-city"[^>]*>[\\s\\S]*?<\\/span>\\s*<span class="b-status"[^>]*>[\\s\\S]*?<\\/span>\\s*<\\/a>`
  );
  out = out.replace(cardRe, (match) => {
    const withActive = match.replace('class="branch-card"', 'class="branch-card is-active"');
    return withActive.replace(
      '<span class="b-icon">',
      '<span class="b-pin" data-i18n="branch.current">Сіз осындасыз</span>\n        <span class="b-icon">'
    );
  });

  // Hero: swap the sales pitch for a "this branch is coming soon" notice.
  const heroReplacement = `<span class="hero-eyebrow"><span class="dot"></span><span data-i18n="soon.badge">Жақында ашылады</span></span>
    <h1 class="hero-title" data-reveal>Zhas Aru ZR — ${city.titleKk} <em data-i18n="soon.title">жақында ашылады</em></h1>
    <p class="hero-sub" data-i18n="soon.sub" data-reveal>Бұл филиал жақында ашылады. Толық ақпарат алу үшін бізге хабарласыңыз немесе WhatsApp арқылы жазыңыз.</p>`;
  out = out.replace(HERO_BLOCK, heroReplacement);

  // About section portrait: this city's own specialist instead of the founder.
  if (city.aboutPhoto) {
    out = out.replace(
      ABOUT_IMG,
      `<img src="${city.aboutPhoto.src}" alt="${city.aboutPhoto.alt}" loading="lazy">`
    );
  }

  // Contact card + footer + mobile drawer: generic address label, "coming soon" value.
  out = out.replaceAll('data-i18n="contact.addressT">Мекенжай (Алматы)', 'data-i18n="contact.addressGeneric">Мекенжай');
  out = out.replaceAll('data-i18n="contact.address">Ақсай 1, 11/7, Zhas Aru ZR', 'data-i18n="contact.addressSoon">Мекенжай жақында жарияланады');
  out = out.replaceAll('data-i18n="contact.address">Ақсай 1, 11/7', 'data-i18n="contact.addressSoon">Мекенжай жақында жарияланады');

  // Map: no real coordinates yet, show a placeholder instead of Almaty's map.
  out = out.replace(
    MAP_BLOCK,
    `<div class="map-embed" style="display:flex;align-items:center;justify-content:center;background:var(--green-50);">
        <span style="color:var(--ink-soft);font-weight:700;" data-i18n="map.soon">Карта жақында қосылады</span>
      </div>`
  );

  // index.html's paths are relative to the project root. This file lives one
  // level deeper (branches/<file>.html), so: assets/* and index.html need a
  // "../" prefix, and sibling branch links ("branches/x.html") just become
  // "x.html". Order matters — do the more specific replacements first.
  out = out.replaceAll('="branches/', '="');
  out = out.replaceAll('="assets/', '="../assets/');
  out = out.replaceAll('="index.html"', '="../index.html"');

  const outDir = path.join(__dirname, 'branches');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, city.file), out, 'utf8');
  console.log('Wrote branches/' + city.file);
}
