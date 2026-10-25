import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CommandDispatcher } from '../src/application/CommandDispatcher.js';
import { EditorSession } from '../src/application/EditorSession.js';
import { CommandLine } from '../src/cli/CommandLine.js';
import { MemoryFileStore } from './support/MemoryFileStore.js';
import { StubCodec } from './support/StubCodec.js';

test('CLI creates nested shapes, quoted text, colors, and geometry-rich displays', async () => {
  const session = new EditorSession(new MemoryFileStore(), new StubCodec());
  const cli = new CommandLine(new CommandDispatcher(session));
  assert.match(await cli.execute('tree'), /^error: no document/);
  assert.match(await cli.execute('help'), /create <type>/);
  await cli.execute('init');
  await cli.execute('create g scene');
  await cli.execute('create rect r 1.5 -2 30 40 #ffffff in scene');
  await cli.execute('create text t 0 10 "hello world" in scene');
  assert.equal(session.document.find('r').attributes.fill, '#ffffff');
  assert.equal(session.document.find('t').content, 'hello world');
  assert.match(await cli.execute('tree scene'), /rect#r x=1.5 y=-2 w=30 h=40/);
  assert.match(await cli.execute('show t'), /parent=g#scene/);
  assert.match(await cli.execute('show r'), /x=1.5/);
  assert.equal(await cli.execute('  # a comment'), '');
  assert.equal(await cli.execute('create text q 0 0 "in"'), 'text#q created');
  assert.equal(await cli.execute('create text empty 0 0 ""'), 'text#empty created');
  assert.match(await cli.execute('create text bad 0 0 "unterminated'), /^error: unterminated/);
  assert.match(await cli.execute('create text bad 0 0 "in" target'), /^error: invalid parameters for text/);
  assert.equal(session.document.find('empty').content, '');
});

test('every editing command is one complete undo/redo unit', async () => {
  const session = new EditorSession(new MemoryFileStore(), new StubCodec());
  const cli = new CommandLine(new CommandDispatcher(session));
  for (const command of ['init', 'create g outer', 'create rect a 1 2 3 4 in outer', 'create circle b 5 6 7 in outer']) {
    assert.doesNotMatch(await cli.execute(command), /^error:/);
  }
  const cases = [
    'move a 10 20', 'scale a 2', 'set a fill red', 'group inner b a',
    'ungroup inner', 'addto outer b', 'front a', 'back a', 'delete outer',
  ];
  for (const command of cases) {
    const before = await cli.execute('tree');
    assert.doesNotMatch(await cli.execute(command), /^error:/, command);
    const after = await cli.execute('tree');
    assert.match(await cli.execute('undo'), /^undone:/, command);
    assert.equal(await cli.execute('tree'), before, command);
    assert.match(await cli.execute('redo'), /^redone:/, command);
    assert.equal(await cli.execute('tree'), after, command);
    if (command === 'group inner b a') {
      // group is placed under outer, allowing the following nested ungroup.
      assert.equal(session.document.parentLabel(session.document.find('inner')), 'g#outer');
    }
  }
});

test('failed commands preserve document, redo and current path', async () => {
  const files = new MemoryFileStore();
  const session = new EditorSession(files, new StubCodec());
  const cli = new CommandLine(new CommandDispatcher(session));
  await cli.execute('init');
  await cli.execute('create rect a 1 2 3 4');
  await cli.execute('move a 2 3');
  await cli.execute('undo');
  const before = await cli.execute('tree');
  for (const command of [
    'create rect a 0 0 1 1', 'create circle c 1 2 -3', 'move a 1 NaN',
    'scale a 0', 'set a id b', 'group bad a missing', 'read missing.svg',
    'save', 'canvas 0 2', 'create g child in a', 'create g child in missing',
  ]) {
    assert.match(await cli.execute(command), /^error:/, command);
    assert.equal(await cli.execute('tree'), before, command);
    assert.equal(session.path, undefined);
  }
  assert.match(await cli.execute('redo'), /^redone:/);
  assert.equal(session.document.find('a').attributes.x, '3');
  await cli.execute('undo');
  await cli.execute('set a fill blue');
  assert.equal(await cli.execute('redo'), 'error: nothing to redo');
});

test('document commands create history barriers only after success; queries do not', async () => {
  const files = new MemoryFileStore();
  const session = new EditorSession(files, new StubCodec());
  const cli = new CommandLine(new CommandDispatcher(session));
  await cli.execute('init');
  assert.equal(await cli.execute('undo'), 'error: undo not allowed after io command');
  await cli.execute('create g g');
  await cli.execute('canvas'); await cli.execute('show g'); await cli.execute('help');
  assert.match(await cli.execute('undo'), /^undone:/);
  await cli.execute('redo');
  files.deny('bad.svg');
  assert.equal(await cli.execute('save bad.svg'), 'error: cannot write file: bad.svg');
  assert.match(await cli.execute('undo'), /^undone:/);
  await cli.execute('redo');
  for (const barrier of ['save good.svg', 'canvas 900 700', 'read good.svg', 'init 100 200']) {
    assert.doesNotMatch(await cli.execute(barrier), /^error:/);
    assert.equal(await cli.execute('undo'), 'error: undo not allowed after io command');
    assert.equal(await cli.execute('redo'), 'error: undo not allowed after io command');
    await cli.execute('create g next');
    assert.match(await cli.execute('undo'), /^undone:/);
  }
});

test('recursive numeric overflow rolls back earlier child mutations', async () => {
  const session = new EditorSession(new MemoryFileStore(), new StubCodec());
  const cli = new CommandLine(new CommandDispatcher(session));
  for (const command of ['init', 'create g g', 'create rect a 1 2 3 4 in g', 'create circle b 1e308 0 1 in g']) await cli.execute(command);
  const before = await cli.execute('tree');
  assert.match(await cli.execute('scale g 10'), /^error:/);
  assert.equal(await cli.execute('tree'), before);
  assert.match(await cli.execute('undo'), /^undone: circle#b created/);
});
