import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { XmlSvgCodec } from '../src/infrastructure/XmlSvgCodec.js';
import { TemporaryWorkspace } from './support/TemporaryWorkspace.js';

test('real CLI processes stdin in order, reports errors on stderr, and continues after failure', async t => {
  const workspace = await TemporaryWorkspace.create();
  t.after(() => workspace.dispose());
  const entry = fileURLToPath(new URL('../src/main.ts', import.meta.url));
  const result = spawnSync(process.execPath, ['--import', import.meta.resolve('tsx'), entry], {
    cwd: workspace.path, encoding: 'utf8',
    input: [
      '# replay', 'init 320 240', 'create g node', 'create text t 10 20 "中文 & <文本>" in node',
      'create rect r 0 0 100 40 #eee in node', 'move missing 1 2', 'move node 5 6',
      'save "output file.svg"', 'tree', '',
    ].join('\n'),
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1);
  assert.equal(result.stderr.trim(), 'error: no such shape: missing');
  assert.match(result.stdout, /svg-editor 0.1/);
  assert.match(result.stdout, /text#t \(15,26\)/);
  const document = new XmlSvgCodec().decode(await readFile(join(workspace.path, 'output file.svg'), 'utf8')).document;
  assert.equal(document.find('t').content, '中文 & <文本>');
  assert.equal(document.count, 3);
});

test('real CLI supports script files with spaces, EOF without a final newline and invalid options', async t => {
  const workspace = await TemporaryWorkspace.create();
  t.after(() => workspace.dispose());
  const entry = fileURLToPath(new URL('../src/main.ts', import.meta.url));
  const script = join(workspace.path, 'my commands.txt');
  await writeFile(script, 'init\ncreate circle c 1 2 3 red\nsave circle.svg');
  const result = spawnSync(process.execPath, ['--import', import.meta.resolve('tsx'), entry, '--script', script], {
    cwd: workspace.path, encoding: 'utf8',
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.match(result.stdout, /saved to circle.svg \(1 elements\)/);
  assert.equal(new XmlSvgCodec().decode(await readFile(join(workspace.path, 'circle.svg'), 'utf8')).document.find('c').attributes.r, '3');
  const invalid = spawnSync(process.execPath, ['--import', import.meta.resolve('tsx'), entry, '--invalid'], { encoding: 'utf8' });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /^error: usage:/);
});
