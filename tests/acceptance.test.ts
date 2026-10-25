import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { CommandDispatcher } from '../src/application/CommandDispatcher.js';
import { EditorSession } from '../src/application/EditorSession.js';
import { CommandLine } from '../src/cli/CommandLine.js';
import { XmlSvgCodec } from '../src/infrastructure/XmlSvgCodec.js';
import { MemoryFileStore } from './support/MemoryFileStore.js';

test('assignment typical transcript preserves undo granularity, exact errors and SVG import results', async () => {
  const files = new MemoryFileStore();
  const codec = new XmlSvgCodec();
  const session = new EditorSession(files, codec);
  const cli = new CommandLine(new CommandDispatcher(session));
  for (const command of [
    'init 800 600', 'create rect bg 0 0 800 600 #ffffff',
    'create text title 20 40 "My Diagram"', 'create circle c1 100 100 20 red',
    'create rect box 200 80 60 60 #3366ff', 'group markers c1 box',
  ]) assert.doesNotMatch(await cli.execute(command), /^error:/);
  assert.deepEqual(session.document.find('markers').children.map(shape => shape.id), ['c1', 'box']);
  await cli.execute('move c1 30 0');
  assert.equal(session.document.find('c1').attributes.cx, '130');
  await cli.execute('undo');
  assert.equal(session.document.find('c1').attributes.cx, '100');
  await cli.execute('redo');
  assert.equal(session.document.find('c1').attributes.cx, '130');
  await cli.execute('set title text "My Diagram v2"');
  await cli.execute('undo');
  assert.equal(session.document.find('title').content, 'My Diagram');
  const before = await cli.execute('tree');
  assert.equal(await cli.execute('group bad c1 markers'), 'error: cannot group a container into its own descendant: markers');
  assert.equal(await cli.execute('tree'), before);
  await cli.execute('delete box');
  assert.throws(() => session.document.find('box'), /no such shape/);
  await cli.execute('undo');
  assert.equal(await cli.execute('tree'), before);
  assert.equal(await cli.execute('save demo.svg'), 'saved to demo.svg (5 elements)');
  assert.equal(codec.decode(await files.read('demo.svg')).document.count, 5);
  assert.equal(await cli.execute('undo'), 'error: undo not allowed after io command');
  await files.write('other.svg', await readFile(new URL('../examples/other.svg', import.meta.url), 'utf8'));
  assert.equal(await cli.execute('read other.svg'), 'warning: assigned id rect1 to unnamed <rect>\nread other.svg (7 elements)');
  assert.equal(session.document.width, 400);
  assert.equal(session.document.find('t1').content, 'imported');
  assert.equal(session.document.parentLabel(session.document.find('c2')), 'g#g1');
});

test('cross-parent grouping preserves traversal order and undo restores each original parent and position', async () => {
  const session = new EditorSession(new MemoryFileStore(), new XmlSvgCodec());
  const cli = new CommandLine(new CommandDispatcher(session));
  for (const command of [
    'init', 'create g left', 'create g right',
    'create rect a 1 2 3 4 in left', 'create rect b 5 6 7 8 in left',
    'create circle c 1 2 3 in right', 'create circle d 4 5 6 in right',
  ]) assert.doesNotMatch(await cli.execute(command), /^error:/);
  const before = await cli.execute('tree');
  assert.equal(await cli.execute('group merged d a'), 'g#merged created with 2 children');
  assert.deepEqual(session.document.find('merged').children.map(shape => shape.id), ['a', 'd']);
  assert.deepEqual(session.document.find('left').children.map(shape => shape.id), ['merged', 'b']);
  assert.deepEqual(session.document.find('right').children.map(shape => shape.id), ['c']);
  await cli.execute('undo');
  assert.equal(await cli.execute('tree'), before);
  await cli.execute('redo');
  await cli.execute('create g child in merged');
  const nested = await cli.execute('tree');
  assert.equal(await cli.execute('addto child merged'), 'error: cannot group a container into its own descendant: merged');
  assert.equal(await cli.execute('tree'), nested);
  assert.equal(await cli.execute('ungroup left'), 'error: cannot ungroup top-level container: left');
});
