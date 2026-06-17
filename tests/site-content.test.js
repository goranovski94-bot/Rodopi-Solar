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
  /<a href="#systems" class="badge-link">Deye системи<\/a>/,
  /<a href="#batteries" class="badge-link">LiFePO4 батерии<\/a>/,
  /<a href="#portfolio" class="badge-link">Портфолио<\/a>/,
  /<li class="nav__item"><a href="#contact">Контакти<\/a><\/li>/,
  /<li class="nav__item"><a href="#consult" class="nav__cta">Безплатна консултация<\/a><\/li>/,
  /<a href="#systems" class="btn btn--primary btn--sm">РАЗГЛЕДАЙ ТУК<\/a>/,
].forEach((pattern) => assert.match(html, pattern));

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
const internalLinks = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
internalLinks
  .filter((id) => id.length > 0)
  .forEach((id) => assert.ok(ids.has(id), `Internal link points to missing section: #${id}`));

console.log('Site content checks passed');
