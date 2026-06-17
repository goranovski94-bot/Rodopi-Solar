const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
const normalizedText = html
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function countText(text) {
  return normalizedText.split(text).length - 1;
}

function assertIncludes(value, message) {
  assert.ok(normalizedText.includes(value) || html.includes(value), message);
}

[
  'Системи за дома',
  'Трифазни инвертори',
  'Монофазни инвертори',
  'Монокристални панели',
  'Поликристални панели',
  'Конструкции за панели',
  'Конструкции за фотоволтаици',
  'Конструкции за ФЕЦ',
  'Phono Solar',
  'SmartSolar',
  'pavel@rodopi-solar.bg',
].forEach((forbidden) => {
  assert.ok(!normalizedText.includes(forbidden) && !html.includes(forbidden), `Forbidden content still exists: ${forbidden}`);
});

assertIncludes('rodopisolar@gmail.com', 'Contact email must be rodopisolar@gmail.com');
assert.ok(!html.includes('href="mailto:rodopisolar@gmail.com"'), 'Email links must point to the free consultation section');
assert.ok(!html.includes('href="tel:+359898459205"'), 'Phone links must point to the free consultation section');
assert.match(html, /<a href="#consult"[^>]*>\+359898459205<\/a>/, 'Phone text must link to free consultation');
assert.match(html, /<a href="#consult"[^>]*>rodopisolar@gmail.com<\/a>/, 'Email text must link to free consultation');
assert.ok(html.includes('class="footer__contact-link"'), 'Footer contact links must use the emphasized contact style');
assert.strictEqual(countText('Инвестирайте в устойчива енергия'), 1, 'Hero headline must appear once');
assert.strictEqual(
  countText('Намалете сметките си за ток и осигурете енергийна независимост за години напред.'),
  1,
  'Hero support text must appear once'
);

[
  'Фотоволтаични панели',
  'Хибридни ФЕЦ системи',
  'Хибридни инвертори Deye',
  'Литиеви батерии LiFePO4',
  'Deye системи',
  'LiFePO4 батерии',
  'Портфолио',
  'JA Solar',
  'LONGi Solar',
  'Jinko Solar',
  'GCL Solar',
].forEach((required) => assertIncludes(required, `Missing required content: ${required}`));

['6 kW', '8 kW', '10 kW', '12 kW', '15 kW', '20 kW'].forEach((size) => {
  assertIncludes(size, `Missing hybrid system size: ${size}`);
});

[
  /<div class="header__quick-nav" aria-label="Бърза навигация към продуктови секции">/,
  /<button type="button" class="quick-link quick-link--products" id="productsToggle" aria-haspopup="true" aria-expanded="false">Продукти/,
  /<a href="#systems" class="quick-link">Deye системи<\/a>/,
  /<a href="#batteries" class="quick-link">LiFePO4 батерии<\/a>/,
  /<a href="#portfolio" class="quick-link">Портфолио<\/a>/,
  /<button type="button" class="theme-toggle" id="themeToggle" aria-label="Смени тъмен и светъл режим" aria-pressed="false">/,
  /<li class="nav__item"><a href="#footer-contact">Контакти<\/a><\/li>/,
  /<a href="#systems" class="btn btn--primary btn--sm">РАЗГЛЕДАЙ ТУК<\/a>/,
].forEach((pattern) => assert.match(html, pattern));

const headerMatch = html.match(/<header class="header" id="header">([\s\S]*?)<\/header>/);
assert.ok(headerMatch, 'Header must exist');
assert.ok(headerMatch[1].indexOf('id="themeToggle"') < headerMatch[1].indexOf('href="#about"'), 'Theme toggle must appear before About in the header');
assert.ok(!headerMatch[1].includes('Безплатна консултация'), 'Free consultation must not appear in the top header');
assert.ok(!html.includes('hero__brand-name'), 'Hero must not show Rodopi Solar text above the headline');
assert.ok(!html.includes('Всички права запазени'), 'Footer legal copyright row must be removed');
assert.ok(!html.includes('Политика за поверителност'), 'Footer privacy link must be removed');
assert.ok(!html.includes('Политика за бисквитки'), 'Footer cookies link must be removed');
assert.ok(!html.includes('Общи условия'), 'Footer terms link must be removed');
assertIncludes(
  'В Родопи Солар предлагаме проектиране, продажба, доставка и монтаж на високоефективни фотоволтаични системи, качествени компоненти, професионален монтаж и гаранция за дълъг експлоатационен живот за Вашите ФЕЦ системи.',
  'Footer description must use the requested Rodopi Solar service text'
);

const productsDropdownMatch = html.match(/<ul class="nav__dropdown">([\s\S]*?)<\/ul>/);
assert.ok(productsDropdownMatch, 'Products dropdown must exist');
assert.ok(!productsDropdownMatch[1].includes('#portfolio'), 'Portfolio must not be listed in Products dropdown');
assert.ok(!html.includes('<a href="#portfolio" class="catalog-card'), 'Portfolio must not be a product catalog card');
assert.ok(!html.includes('header__badge-bar'), 'The separate quick-link badge bar must be removed');
assert.match(html, /<footer class="footer" id="footer-contact">/, 'Contacts link must target the bottom footer contact area');
assert.match(css, /\.quick-menu:focus-within \.nav__dropdown,\s*\.quick-menu\.open \.nav__dropdown/, 'Mobile products dropdown must open from the JS open state');
assert.match(css, /\.quick-link--products\[aria-expanded="true"\] \+ \.nav__dropdown/, 'Products dropdown must also open from aria-expanded for touch devices');
assert.match(css, /@media \(max-width: 1024px\)[\s\S]*\.header__quick-nav \{[\s\S]*overflow: visible;/, 'Quick nav must not clip the products dropdown on tablet and phone');
assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.header__burger \{ display: none; \}/, 'Mobile burger menu must be hidden');
assert.match(css, /@media \(max-width: 768px\)[\s\S]*\.header__nav \{[\s\S]*position: static;/, 'Mobile About and Contacts links must remain visible beside the logo');
assert.ok(js.includes('setDropdownState(false);\n        scrollToSection(targetSection);'), 'Product dropdown must close after selecting a section');
assert.ok(js.includes("link.addEventListener('touchend'"), 'Products dropdown must listen for touchend on mobile devices');
assert.ok(js.includes("} else if (e.key === 'Escape') {\n        setDropdownState(false);"), 'Escape must close the products dropdown');
assert.ok(html.includes("localStorage.getItem('rodopi_theme')"), 'Saved theme must be applied before CSS loads');
assert.match(css, /:root\[data-theme="dark"\]/, 'Dark theme variables must exist');
assert.match(css, /:root\[data-theme="dark"\] \.catalog-card--highlight,[\s\S]*:root\[data-theme="dark"\] \.portfolio\.section--gray/, 'Dark theme must cover fixed light catalog and portfolio backgrounds');
assert.match(css, /\.header__logo \{[\s\S]*border: 1px solid rgba\(245,158,11,\.2\);/, 'Header logo must have a clear badge border');
assert.match(css, /:root\[data-theme="dark"\] \.header__logo \{[\s\S]*border-color: rgba\(245,158,11,\.36\);/, 'Header logo must stay defined in dark mode');
assert.match(css, /\.hero__content \{[\s\S]*color: #FFFFFF;/, 'Hero content must stay readable in dark mode');
assert.match(css, /\.hero__title \{[\s\S]*color: #FFFFFF;/, 'Hero title must stay white over the image in dark mode');
assert.match(css, /\.catalog__banner \{[\s\S]*color: #FFFFFF;/, 'Best-selling catalog banner must stay readable in dark mode');
assert.match(css, /\.consult-cta \{[\s\S]*color: #FFFFFF;/, 'Consult section text must stay readable in dark mode');
assert.match(css, /\.consult-cta__text h2 \{[\s\S]*color: #FFFFFF;/, 'Consult heading must stay readable in dark mode');
assert.match(css, /\.consult-contact h3 \{[\s\S]*color: #FFFFFF;/, 'Consult contact heading must stay readable in dark mode');
assert.match(css, /:root\[data-theme="dark"\] \.quick-link--products,[\s\S]*color: #0F172A;/, 'Products pill text must stay readable on orange in dark mode');
assert.match(css, /\.btn--outline-white \{[\s\S]*color: #FFFFFF;[\s\S]*border: 2px solid #FFFFFF;/, 'White outline buttons must stay readable in dark mode');
assert.match(css, /\.footer__col h4 \{[\s\S]*color: #F8FAFC;/, 'Footer headings must stay readable in dark mode');
assert.match(css, /\.footer__hours strong \{[\s\S]*color: #FFFFFF;/, 'Footer working hours must stay readable in dark mode');
assert.match(css, /\.footer__contact-link \{[\s\S]*background: rgba\(15,23,42,\.72\);/, 'Footer contact links must be highlighted as visible chips');
assert.match(css, /@media \(max-width: 480px\)[\s\S]*\.footer__contact-link \{[\s\S]*width: calc\(100% - 4\.8rem\);/, 'Footer contact links must avoid the floating scroll button on phones');
assert.match(css, /\.theme-toggle\[aria-pressed="true"\] \.theme-toggle__thumb/, 'Theme toggle must have an active visual state');
assert.ok(js.includes("localStorage.setItem('rodopi_theme', nextTheme)"), 'Theme choice must be saved');
assert.ok(js.includes("themeToggle.addEventListener('click'"), 'Theme toggle must respond to clicks and taps');
assert.ok(js.includes('window.innerWidth > mobileBreakpoint ? true'), 'Desktop products click must keep the dropdown open after hover');

[
  'assets/products/photovoltaic-panels-closeup.jpg',
  'assets/products/photovoltaic-panels-roof.jpg',
  'assets/products/hybrid-system-deye-lifepo4.jpg',
  'assets/products/deye-hybrid-inverter.png',
  'assets/products/deye-hybrid-inverter-clean.png',
  'assets/products/lifepo4-battery-cabinet.jpg',
  'assets/products/deye-system-scene-20kw.jpg',
  'assets/products/inverter-storage-installation.jpg',
].forEach((src) => {
  assert.ok(html.includes(src), `Missing product image: ${src}`);
});

const pagePhotoSources = [...html.matchAll(/<img src="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((src) => !src.includes('/logos/') && !src.includes('rodopi-solar-logo'));
assert.strictEqual(
  new Set(pagePhotoSources).size,
  pagePhotoSources.length,
  'Visible non-logo photos must not repeat across the page'
);

const portfolioMatch = html.match(/<section class="portfolio section section--gray" id="portfolio">([\s\S]*?)<\/section>/);
assert.ok(portfolioMatch, 'Portfolio section must exist');
assert.ok(!portfolioMatch[1].includes('images.unsplash.com'), 'Portfolio must use local suitable project images');
assert.ok(!portfolioMatch[1].includes('assets/products/'), 'Portfolio must not reuse product images');
const portfolioImageSources = [...portfolioMatch[1].matchAll(/<img src="([^"]+)"/g)].map((match) => match[1]);
assert.ok(portfolioImageSources.length >= 9, 'Portfolio should show a complete gallery of project images');
assert.strictEqual(
  new Set(portfolioImageSources).size,
  portfolioImageSources.length,
  'Portfolio image sources must not repeat'
);
portfolioImageSources.forEach((src) => {
  assert.ok(src.startsWith('assets/portfolio/'), `Portfolio image must come from assets/portfolio: ${src}`);
});
[
  'assets/portfolio/solar-portfolio-18kw.jpg',
  'assets/portfolio/solar-portfolio-12kw-roof.jpg',
  'assets/portfolio/solar-portfolio-15kw.jpg',
  'assets/portfolio/solar-portfolio-bright-field.jpg',
  'assets/portfolio/solar-portfolio-field-closeup.jpg',
  'assets/portfolio/solar-portfolio-flat-roof.jpg',
  'assets/portfolio/solar-portfolio-home-roof.jpg',
  'assets/portfolio/solar-portfolio-aerial-panel-rows.jpg',
  'assets/portfolio/solar-portfolio-field-array.jpg',
  'assets/portfolio/solar-portfolio-residential-roof.jpg',
  'assets/portfolio/solar-portfolio-sunset-roof.jpg',
].forEach((src) => {
  assert.ok(portfolioMatch[1].includes(src), `Missing local portfolio image: ${src}`);
});
assert.ok(
  !/portfolio\/[^"]*(worker|installer|people|person|human)[^"]*\.(jpg|png|webp)/i.test(portfolioMatch[1]),
  'Portfolio images must not include people-focused filenames'
);

[
  ['DEYE', 'assets/logos/deye.png'],
  ['DAH Solar', 'assets/logos/dah-solar.png'],
  ['JA Solar', 'assets/logos/ja-solar.svg'],
  ['LONGi Solar', 'assets/logos/longi-solar.png'],
  ['Jinko Solar', 'assets/logos/jinko-solar.svg'],
  ['GCL Solar', 'assets/logos/gcl-solar.svg'],
].forEach(([alt, src]) => {
  assert.match(html, new RegExp(`<img src="${src}" alt="${alt}"`), `Missing logo image: ${alt}`);
});

const manufacturersMatch = html.match(/<section class="manufacturers section"[^>]*>([\s\S]*?)<\/section>/);
assert.ok(manufacturersMatch, 'Manufacturers section must exist');
assert.ok(!manufacturersMatch[1].includes('<text'), 'Manufacturers logos must use image assets, not SVG text placeholders');
assert.match(css, /:root\[data-theme="dark"\] \.brand-pills span,[\s\S]*:root\[data-theme="dark"\] \.manufacturer-logo \{[\s\S]*background: linear-gradient\(145deg, #FFFFFF/, 'Manufacturer logos must stay on a light logo card in dark mode');
assert.match(css, /:root\[data-theme="dark"\] \.brand-pills img,[\s\S]*:root\[data-theme="dark"\] \.manufacturer-logo img \{[\s\S]*opacity: 1;/, 'Manufacturer logos must stay fully visible in dark mode');

const panelBrandsMatch = html.match(/<div class="brand-pills"[^>]*>([\s\S]*?)<\/div>/);
assert.ok(panelBrandsMatch, 'Panel brand logo list must exist');
[
  ['DAH Solar', 'assets/logos/dah-solar.png'],
  ['JA Solar', 'assets/logos/ja-solar.svg'],
  ['LONGi Solar', 'assets/logos/longi-solar.png'],
  ['Jinko Solar', 'assets/logos/jinko-solar.svg'],
  ['GCL Solar', 'assets/logos/gcl-solar.svg'],
].forEach(([alt, src]) => {
  assert.match(panelBrandsMatch[1], new RegExp(`<img src="${src}" alt="${alt}"`), `Missing panel brand logo: ${alt}`);
});

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
const internalLinks = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
internalLinks
  .filter((id) => id.length > 0)
  .forEach((id) => assert.ok(ids.has(id), `Internal link points to missing section: #${id}`));

console.log('Site content checks passed');
