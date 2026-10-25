import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ShapeFactory } from '../src/domain/ShapeFactory.js';
import { SvgDocument } from '../src/domain/SvgDocument.js';

test('all six shapes implement polymorphic move/scale and clone independently', () => {
  const factory = new ShapeFactory();
  const doc = new SvgDocument();
  doc.add(factory.create('g', 'scene', []));
  for (const [type, values] of [
    ['rect', ['1', '2', '3', '4']], ['circle', ['1', '2', '3']],
    ['ellipse', ['1', '2', '3', '4']], ['line', ['1', '2', '3', '4']],
    ['text', ['1', '2', '你好']],
  ] as const) doc.add(factory.create(type, type, values), 'scene');
  const copy = doc.clone();
  doc.find('scene').move(10, 20);
  doc.find('scene').scale(2);
  assert.equal(doc.find('rect').attributes.x, '22');
  assert.equal(doc.find('circle').attributes.r, '6');
  assert.equal(doc.find('ellipse').attributes.ry, '8');
  assert.equal(doc.find('line').attributes.x2, '26');
  assert.equal(doc.find('text').content, '你好');
  assert.equal(copy.find('rect').attributes.x, '1');
});

test('group preserves document order and detects selected ancestors', () => {
  const factory = new ShapeFactory();
  const doc = new SvgDocument();
  for (const id of ['a', 'b', 'c']) doc.add(factory.create('rect', id, ['0', '0', '1', '1']));
  doc.group('outer', ['c', 'a']);
  assert.deepEqual(doc.find('outer').children.map(shape => shape.id), ['a', 'c']);
  assert.deepEqual(doc.children.map(shape => shape.id), ['outer', 'b']);
  assert.throws(() => doc.group('bad', ['a', 'outer']), /own descendant: outer/);
  assert.throws(() => doc.addTo('outer', 'outer'), /own descendant/);
  assert.throws(() => doc.ungroup('outer'), /top-level container/);
});

test('nested ungroup replaces its position, and deleting a subtree releases ids', () => {
  const doc = new SvgDocument();
  const factory = new ShapeFactory();
  doc.add(factory.create('g', 'outer', []));
  doc.add(factory.create('g', 'inner', []), 'outer');
  doc.add(factory.create('circle', 'c', ['0', '0', '1']), 'inner');
  doc.add(factory.create('g', 'last', []), 'outer');
  doc.ungroup('inner');
  assert.deepEqual(doc.find('outer').children.map(shape => shape.id), ['c', 'last']);
  doc.delete('outer');
  doc.assertAvailable('c');
});

test('ids, dimensions, attributes and finite numeric results are validated', () => {
  const factory = new ShapeFactory();
  assert.throws(() => factory.create('box', 'b', []), /unknown shape type: box/);
  assert.throws(() => factory.create('rect', 'r', ['0', '0', '-1', '2']), /non-negative/);
  const circle = factory.create('circle', 'C', ['0', '0', '2']);
  assert.throws(() => circle.set('id', 'new'), /unknown attribute: id/);
  assert.throws(() => circle.set('x', '1'), /unknown attribute: x/);
  assert.throws(() => circle.scale(0), /scale factor must be positive/);
  assert.throws(() => circle.set('r', 'Infinity'), /invalid r/);
  assert.throws(() => new SvgDocument(0, 100), /canvas width must be positive/);
  const doc = new SvgDocument();
  doc.add(circle);
  doc.add(factory.create('g', 'c', []));
  assert.throws(() => doc.add(factory.create('g', 'C', [])), /id already exists: C/);
});
