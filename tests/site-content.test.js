const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
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
  /<li class="nav__item"><a href="#footer-contact">Контакти<\/a><\/li>/,
  /<a href="#systems" class="btn btn--primary btn--sm">РАЗГЛЕДАЙ ТУК<\/a>/,
].forEach((pattern) => assert.match(html, pattern));

const headerMatch = html.match(/<header class="header" id="header">([\s\S]*?)<\/header>/);
assert.ok(headerMatch, 'Header must exist');
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

[
  'assets/products/hybrid-system-deye-lifepo4.jpg',
  'assets/products/deye-hybrid-inverter.png',
  'assets/products/lifepo4-battery-cabinet.jpg',
].forEach((src) => {
  assert.ok(html.includes(src), `Missing product image: ${src}`);
});

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
