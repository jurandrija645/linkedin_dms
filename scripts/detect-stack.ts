/**
 * Prepoznaj alate koje lead koristi na svojoj stranici.
 *   npx tsx scripts/detect-stack.ts https://example.com
 *   npx tsx scripts/detect-stack.ts https://example.com --json
 *
 * Fetcha HTML (naslovna + par tipicnih podstranica) i trazi potpise poznatih
 * alata. Sve sto vrati je provjerljivo u source codeu stranice, nije nagadjanje.
 * Sluzi za `opener` poruku dan prije Looma.
 */

export {};

type Sig = {
  name: string;
  /** Sto je to, u jednoj recenici, na hrvatskom. */
  what: string;
  /** Kategorija za grupiranje u ispisu. */
  cat: string;
  /** Regexi koji dokazuju prisutnost. Dovoljan je jedan. */
  re: RegExp[];
  /** Je li to dobra polazna tocka za opener pitanje. */
  opener?: boolean;
};

const SIGS: Sig[] = [
  // --- platforma ---
  { name: 'WordPress', what: 'CMS na kojem stranica stoji', cat: 'platforma', re: [/wp-content\//i, /wp-json/i, /wp-includes\//i] },
  { name: 'Wix', what: 'website builder', cat: 'platforma', re: [/static\.wixstatic\.com/i, /wix\.com\/website/i] },
  { name: 'Squarespace', what: 'website builder', cat: 'platforma', re: [/squarespace\.com/i, /static1\.squarespace/i] },
  { name: 'Webflow', what: 'website builder', cat: 'platforma', re: [/webflow\.(com|io)/i, /data-wf-site/i] },
  { name: 'Duda', what: 'website builder koji agencije preprodaju', cat: 'platforma', re: [/dudamobile|dudaone|irp\.cdn-website\.com/i] },
  { name: 'GoHighLevel', what: 'all-in-one CRM i funnel alat, tipicno preko agencije', cat: 'platforma', re: [/msgsndr\.com/i, /gohighlevel/i, /leadconnectorhq/i], opener: true },
  { name: 'Shopify', what: 'webshop platforma', cat: 'platforma', re: [/cdn\.shopify\.com/i] },

  // --- WP graditelji i teme ---
  { name: 'Elementor', what: 'WordPress page builder', cat: 'platforma', re: [/elementor-(element|widget|section|kit|frontend)|plugins\/elementor/i] },
  { name: 'Divi', what: 'WordPress tema i builder', cat: 'platforma', re: [/et_pb_|\/themes\/Divi\//i] },
  { name: 'WPBakery', what: 'stariji WordPress builder', cat: 'platforma', re: [/js_composer|vc_row/i] },
  { name: 'Astra', what: 'WordPress tema', cat: 'platforma', re: [/\/themes\/astra\//i] },

  // --- field service i CRM ---
  { name: 'ServiceTitan', what: 'field service softver za HVAC, roofing i plumbing', cat: 'crm', re: [/servicetitan\.(com|net)/i], opener: true },
  { name: 'Jobber', what: 'field service softver za manje ekipe', cat: 'crm', re: [/getjobber|jobber\.com/i], opener: true },
  { name: 'Housecall Pro', what: 'field service softver', cat: 'crm', re: [/housecallpro|housecall\.io/i], opener: true },
  { name: 'Workiz', what: 'field service softver', cat: 'crm', re: [/workiz\.com/i], opener: true },
  { name: 'ServiceM8', what: 'field service softver', cat: 'crm', re: [/servicem8\.com/i], opener: true },
  { name: 'HubSpot', what: 'CRM i marketing automation', cat: 'crm', re: [/js\.hs-scripts\.com|hsforms\.(net|com)|hs-analytics/i], opener: true },
  { name: 'Salesforce', what: 'CRM', cat: 'crm', re: [/salesforce\.com|force\.com/i], opener: true },
  { name: 'Zoho', what: 'CRM', cat: 'crm', re: [/zoho\.(com|eu)/i], opener: true },
  { name: 'Pipedrive', what: 'CRM', cat: 'crm', re: [/pipedrive/i], opener: true },
  { name: 'Keap / Infusionsoft', what: 'CRM i automatizacija', cat: 'crm', re: [/infusionsoft|keap\.com/i], opener: true },

  // --- chat ---
  { name: 'Intercom', what: 'live chat', cat: 'chat', re: [/widget\.intercom\.io|intercomcdn/i], opener: true },
  { name: 'Drift', what: 'live chat', cat: 'chat', re: [/js\.driftt\.com|drift\.com/i], opener: true },
  { name: 'Tawk.to', what: 'besplatan live chat', cat: 'chat', re: [/tawk\.to/i], opener: true },
  { name: 'Tidio', what: 'live chat', cat: 'chat', re: [/tidio(chat)?\./i], opener: true },
  { name: 'Crisp', what: 'live chat', cat: 'chat', re: [/crisp\.chat/i], opener: true },
  { name: 'LiveChat', what: 'live chat', cat: 'chat', re: [/livechatinc\.com/i], opener: true },
  { name: 'Olark', what: 'live chat', cat: 'chat', re: [/olark\.com/i], opener: true },
  { name: 'Podium', what: 'webchat, SMS i recenzije za lokalne obrte', cat: 'chat', re: [/podium\.com|podium\.co/i], opener: true },
  { name: 'Facebook Messenger chat', what: 'Messenger widget na stranici', cat: 'chat', re: [/connect\.facebook\.net.*customerchat|fb-customerchat/i], opener: true },

  // --- recenzije ---
  { name: 'Birdeye', what: 'upravljanje recenzijama', cat: 'recenzije', re: [/birdeye\.com|birdeye\.co/i], opener: true },
  { name: 'NiceJob', what: 'automatsko trazenje recenzija', cat: 'recenzije', re: [/nicejob\.(com|co)/i], opener: true },
  { name: 'Trustpilot', what: 'recenzije', cat: 'recenzije', re: [/trustpilot\.com/i], opener: true },
  { name: 'Broadly', what: 'recenzije i poruke za lokalne obrte', cat: 'recenzije', re: [/broadly\.com/i], opener: true },
  { name: 'Google Reviews widget', what: 'prikaz Google recenzija', cat: 'recenzije', re: [/elfsight|reviewsonmywebsite|trustindex/i], opener: true },

  // --- booking ---
  { name: 'Calendly', what: 'zakazivanje termina', cat: 'booking', re: [/calendly\.com/i], opener: true },
  { name: 'Acuity', what: 'zakazivanje termina', cat: 'booking', re: [/acuityscheduling/i], opener: true },
  { name: 'Setmore', what: 'zakazivanje termina', cat: 'booking', re: [/setmore\.com/i], opener: true },
  { name: 'YouCanBookMe', what: 'zakazivanje termina', cat: 'booking', re: [/youcanbook\.me/i], opener: true },

  // --- pozivi ---
  { name: 'CallRail', what: 'pracenje poziva, mjeri odakle dolaze', cat: 'pozivi', re: [/callrail/i], opener: true },
  { name: 'CallTrackingMetrics', what: 'pracenje poziva', cat: 'pozivi', re: [/calltrackingmetrics/i], opener: true },
  { name: 'WhatConverts', what: 'pracenje poziva i formulara', cat: 'pozivi', re: [/whatconverts/i], opener: true },
  { name: 'Twilio', what: 'telefonija i SMS', cat: 'pozivi', re: [/twilio\.com|taskrouter|twil\.io/i], opener: true },

  // --- formulari ---
  { name: 'Gravity Forms', what: 'WordPress formulari', cat: 'formulari', re: [/gravity_?forms|gform_/i] },
  { name: 'WPForms', what: 'WordPress formulari', cat: 'formulari', re: [/wpforms/i] },
  { name: 'Contact Form 7', what: 'najbazicniji WordPress formular', cat: 'formulari', re: [/wpcf7/i] },
  { name: 'Typeform', what: 'formulari korak po korak', cat: 'formulari', re: [/typeform\.com/i], opener: true },
  { name: 'JotForm', what: 'formulari', cat: 'formulari', re: [/jotform\.(com|co)/i], opener: true },
  { name: 'HubSpot forms', what: 'HubSpot formulari', cat: 'formulari', re: [/hsforms/i], opener: true },

  // --- email marketing ---
  { name: 'Mailchimp', what: 'email marketing', cat: 'email', re: [/mailchimp|list-manage\.com/i], opener: true },
  { name: 'Klaviyo', what: 'email marketing', cat: 'email', re: [/klaviyo\.com/i], opener: true },
  { name: 'ActiveCampaign', what: 'email marketing i automatizacija', cat: 'email', re: [/activecampaign|acemsa/i], opener: true },
  { name: 'Constant Contact', what: 'email marketing', cat: 'email', re: [/constantcontact|ctctcdn/i], opener: true },

  // --- mjerenje ---
  { name: 'Google Tag Manager', what: 'upravljanje tagovima', cat: 'mjerenje', re: [/googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]{4,}/] },
  { name: 'Google Analytics 4', what: 'analitika', cat: 'mjerenje', re: [/gtag\/js\?id=G-|G-[A-Z0-9]{8,}/] },
  { name: 'Universal Analytics (ugaseno)', what: 'stara Google analitika, ne radi od 2023', cat: 'mjerenje', re: [/UA-\d{4,}-\d/], opener: true },
  { name: 'Meta Pixel', what: 'Facebook pixel, znaci da vrte oglase', cat: 'mjerenje', re: [/connect\.facebook\.net.*fbevents|fbq\(/i], opener: true },
  { name: 'Google Ads konverzije', what: 'mjerenje Google oglasa, znaci da placaju oglase', cat: 'mjerenje', re: [/googleadservices|AW-\d{6,}/], opener: true },
  { name: 'Hotjar', what: 'snimanje ponasanja posjetitelja', cat: 'mjerenje', re: [/hotjar\.com|hjid/i], opener: true },
  { name: 'Microsoft Clarity', what: 'snimanje ponasanja posjetitelja', cat: 'mjerenje', re: [/clarity\.ms/i], opener: true },
  { name: 'LinkedIn Insight', what: 'LinkedIn pixel', cat: 'mjerenje', re: [/snap\.licdn\.com/i], opener: true },

  // --- SEO ---
  { name: 'Yoast SEO', what: 'WordPress SEO dodatak', cat: 'seo', re: [/yoast(-seo)?[./]|Yoast SEO/i] },
  { name: 'Rank Math', what: 'WordPress SEO dodatak', cat: 'seo', re: [/rank-?math/i] },
  { name: 'LocalBusiness schema', what: 'strukturirani podaci za lokalni SEO', cat: 'seo', re: [/"@type"\s*:\s*"(LocalBusiness|HVACBusiness|RoofingContractor|Plumber|Electrician)"/i] },
];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Neki WAF-ovi blokiraju "Chrome" UA bez browser fingerprinta, a curl UA puste.
const FALLBACK_UA = 'curl/8.4.0';

const EXTRA_PATHS = ['', '/contact', '/contact-us', '/about', '/services'];

async function grab(url: string): Promise<string> {
  try {
    const get = (ua: string) =>
      fetch(url, {
        headers: { 'user-agent': ua, accept: 'text/html,*/*' },
        redirect: 'follow',
        signal: AbortSignal.timeout(20000),
      });
    let res = await get(UA);
    if (res.status === 403 || res.status === 429) res = await get(FALLBACK_UA);
    if (!res.ok) return '';
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('html')) return '';
    return await res.text();
  } catch {
    return '';
  }
}

const raw = process.argv[2];
const asJson = process.argv.includes('--json');
if (!raw) {
  console.error('Uporaba: npx tsx scripts/detect-stack.ts <url> [--json]');
  process.exit(1);
}
const base = new URL(raw.startsWith('http') ? raw : `https://${raw}`);

const pages: { url: string; html: string }[] = [];
for (const p of EXTRA_PATHS) {
  const u = new URL(p || '/', base).toString();
  const html = await grab(u);
  if (html) pages.push({ url: u, html });
  // Naslovna je obavezna, ostalo je bonus.
  if (!p && !html) break;
}

if (!pages.length) {
  console.error(`Ne mogu dohvatiti ${base.toString()}. Stranica blokira botove ili je pala.`);
  console.error('Fallback: otvori stranicu u pregledniku, Ctrl+U, pa pretrazi izvorni kod rucno.');
  process.exit(2);
}

const blob = pages.map((p) => p.html).join('\n');

const hits = SIGS.filter((s) => s.re.some((r) => r.test(blob)));

// WordPress tema, ako je ima
const theme = blob.match(/wp-content\/themes\/([a-z0-9_-]+)/i)?.[1] ?? null;

// Telefoni i mailovi, korisni za provjeru identiteta
const phones = [...new Set([...blob.matchAll(/tel:\+?([0-9()\s.-]{7,20})/gi)].map((m) => m[1].trim()))].slice(0, 5);
const mails = [...new Set([...blob.matchAll(/mailto:([^"'?\s>]+)/gi)].map((m) => m[1].toLowerCase()))].slice(0, 5);

if (asJson) {
  console.log(
    JSON.stringify(
      {
        url: base.toString(),
        pages_fetched: pages.map((p) => p.url),
        theme,
        phones,
        mails,
        detected: hits.map((h) => ({ name: h.name, what: h.what, cat: h.cat, opener: !!h.opener })),
      },
      null,
      2
    )
  );
} else {
  console.log(`\n${base.hostname}  (${pages.length} stranica dohvaceno)\n`);
  if (!hits.length) {
    console.log('Nije prepoznat nijedan poznati alat. To je samo po sebi nalaz:');
    console.log('stranica je vjerojatno rucno radjena ili jako stara, bez ijednog mjerenja.\n');
  }
  const byCat = new Map<string, Sig[]>();
  for (const h of hits) byCat.set(h.cat, [...(byCat.get(h.cat) ?? []), h]);
  for (const [cat, list] of byCat) {
    console.log(`  ${cat}`);
    for (const h of list) console.log(`    ${h.opener ? '*' : ' '} ${h.name} — ${h.what}`);
  }
  if (theme) console.log(`\n  WordPress tema: ${theme}`);
  if (phones.length) console.log(`  Telefoni: ${phones.join(', ')}`);
  if (mails.length) console.log(`  Mailovi: ${mails.join(', ')}`);

  const openers = hits.filter((h) => h.opener);
  console.log(`\n  Zvjezdica = dobra podloga za opener pitanje (${openers.length}).`);

  // Odsutnosti su cesto jaci nalaz od prisutnosti.
  const missing: string[] = [];
  if (!hits.some((h) => h.cat === 'chat')) missing.push('nema nikakav chat');
  if (!hits.some((h) => h.cat === 'booking')) missing.push('nema online zakazivanje');
  if (!hits.some((h) => h.cat === 'crm')) missing.push('nema vidljiv CRM ni field service alat');
  if (!hits.some((h) => h.cat === 'pozivi')) missing.push('ne prati pozive');
  if (!hits.some((h) => h.cat === 'recenzije')) missing.push('nema alat za recenzije');
  if (missing.length) console.log(`  Nedostaje: ${missing.join(', ')}.`);
  console.log();
}
