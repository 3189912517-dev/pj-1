import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { DocumentView } from '../src/application/DocumentView.js';
import { ShapeFactory } from '../src/domain/ShapeFactory.js';
import { SvgDocument } from '../src/domain/SvgDocument.js';
import { XmlSvgCodec } from '../src/infrastructure/XmlSvgCodec.js';

test('assignment external SVG imports all seven elements and warns for missing id', async () => {
  const source = await readFile(new URL('../examples/other.svg', import.meta.url), 'utf8');
  const decoded = new XmlSvgCodec().decode(source);
  assert.equal(decoded.document.count, 7);
  assert.deepEqual(decoded.warnings, ['warning: assigned id rect1 to unnamed <rect>']);
  assert.equal(decoded.document.find('r2').attributes.width, '10');
});

test('auto ids reserve later explicit ids and remain unique across nested containers', () => {
  const decoded = new XmlSvgCodec().decode('<svg><g><rect/><rect id="rect1"/><g><rect/></g></g></svg>');
  assert.deepEqual(decoded.document.elements.map(shape => shape.id), ['g1', 'rect2', 'rect1', 'g2', 'rect3']);
  assert.equal(decoded.warnings.length, 4);
  assert.throws(() => new XmlSvgCodec().decode('<svg><rect id="a"/><g id="a"/></svg>'), /id already exists: a/);
});

test('SVG round trip preserves six types, Chinese text, escaped content, styles and order', () => {
  const codec = new XmlSvgCodec();
  const factory = new ShapeFactory();
  const document = new SvgDocument(400, 200);
  document.add(factory.create('g', '组', []));
  for (const [type, values] of [
    ['rect', ['0', '0', '30', '40', '#eee']], ['circle', ['50', '60', '10']],
    ['ellipse', ['70', '80', '5', '9']], ['line', ['1', '2', '3', '4', 'black']],
    ['text', ['1', '2', '中文 & <标记> "引号" 😀']],
  ] as const) document.add(factory.create(type, type, values), '组');
  document.find('组').set('fill', 'red');
  const source = codec.encode(document);
  assert.match(source, /&amp;/); assert.match(source, /&lt;标记&gt;/);
  const result = codec.decode(source);
  assert.equal(new DocumentView().tree(result.document), new DocumentView().tree(document));
  assert.deepEqual(result.warnings, []);
  assert.equal(result.document.find('circle').attributes.fill, undefined);
  assert.equal(codec.encode(result.document), source);
});

test('external presentation attributes, namespace prefixes and transforms survive round trip', () => {
  const codec = new XmlSvgCodec();
  const source = '<s:svg xmlns:s="http://www.w3.org/2000/svg" width="400px" height="200px" viewBox="-5 -5 400 200"><s:g id="g" transform="translate(60,40) scale(0.8)"><s:text id="t" x="1px" y="2" font-size="16" text-anchor="middle"> end </s:text></s:g></s:svg>';
  const document = codec.decode(source).document;
  const again = codec.decode(codec.encode(document)).document;
  assert.equal(again.find('g').attributes.transform, 'translate(60,40) scale(0.8)');
  assert.equal(again.find('t').attributes['font-size'], '16');
  assert.equal(again.find('t').content, ' end ');
  assert.equal(again.attributes.viewBox, '-5 -5 400 200');
  document.resize(800, 600);
  assert.match(codec.encode(document), /viewBox="0 0 800 600"/);
});

test('viewBox provides missing dimensions; simple text CDATA is supported', () => {
  const { document } = new XmlSvgCodec().decode('<svg viewBox="0 0 320 240"><text id="t"><![CDATA[<&中文>]]></text></svg>');
  assert.equal(document.width, 320); assert.equal(document.height, 240);
  assert.equal(document.find('t').content, '<&中文>');
});

test('malformed and unsupported SVG fail explicitly instead of silently dropping content', () => {
  const codec = new XmlSvgCodec();
  for (const source of [
    '', '<svg><rect></svg>', '<html/>', '<svg><rect x="no"/></svg>',
    '<svg><rect width="-2"/></svg>', '<svg><path d="M0 0"/></svg>',
    '<svg><text><tspan>nested</tspan></text></svg>', '<svg><g>unexpected</g></svg>',
    '<svg width="50%"/>', '<!DOCTYPE svg><svg/>', '<svg><rect id="a"/><circle id="a"/></svg>',
    '<svg xmlns="urn:other"/>', '<svg><rect><circle/></rect></svg>', '<svg viewBox="0 0 0 0"/>',
    '<svg><text>invalid\u0001</text></svg>',
  ]) assert.throws(() => codec.decode(source), source);
});
