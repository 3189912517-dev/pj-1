import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Tokenizer } from '../src/cli/Tokenizer.js';

test('tokenizer preserves Windows paths, escaped quotes, empty strings and hash colors', () => {
  const tokenizer = new Tokenizer();
  assert.equal(tokenizer.tokenize(String.raw`read "C:\my files\drawing.svg"`)[1]!.value, String.raw`C:\my files\drawing.svg`);
  assert.equal(tokenizer.tokenize(String.raw`set t text "hello \"SVG\""`)[3]!.value, 'hello "SVG"');
  assert.deepEqual(tokenizer.tokenize('create rect r 0 0 1 1 #ffffff').at(-1), { value: '#ffffff', quoted: false });
  assert.deepEqual(tokenizer.tokenize('set t text ""').at(-1), { value: '', quoted: true });
  assert.deepEqual(tokenizer.tokenize(' \t # ignored'), []);
  assert.deepEqual(tokenizer.tokenize('"in"'), [{ value: 'in', quoted: true }]);
  assert.throws(() => tokenizer.tokenize('set t text "unfinished'), /unterminated double quote/);
});
