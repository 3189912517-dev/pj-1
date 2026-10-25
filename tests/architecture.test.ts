import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

test('source imports respect declared module boundaries and classes use matching files', async () => {
  const root = fileURLToPath(new URL('../src/', import.meta.url));
  const allowed: Readonly<Record<string, readonly string[]>> = {
    domain: ['domain'], application: ['application', 'domain'],
    cli: ['cli', 'application'], infrastructure: ['infrastructure', 'application', 'domain'],
  };
  const files = (await readdir(root, { recursive: true })).filter(file => file.endsWith('.ts'));
  for (const file of files) {
    const full = join(root, file);
    const source = await readFile(full, 'utf8');
    const layer = file.split(/[\\/]/)[0]!;
    const classes = [...source.matchAll(/export\s+(?:abstract\s+)?class\s+(\w+)/g)].map(match => match[1]);
    assert.ok(classes.length <= 1, `more than one class: ${file}`);
    if (classes.length) assert.equal(classes[0], basename(file, '.ts'));
    assert.doesNotMatch(source, /\bswitch\s*\(/, `unexpected switch dispatch in ${file}`);
    for (const match of source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
      const specifier = match[1]!;
      if (!allowed[layer]) continue; // main.ts is the composition root.
      if (!specifier.startsWith('.')) {
        assert.ok(layer === 'cli' || layer === 'infrastructure', `${layer} imports external dependency ${specifier}`);
      } else {
        const target = relative(root, resolve(dirname(full), specifier)).split(/[\\/]/)[0]!;
        assert.ok(allowed[layer]!.includes(target), `${file} depends on forbidden layer ${target}`);
        if (layer === 'infrastructure' && target === 'application') {
          assert.match(specifier, /application\/ports\//, `${file} must depend only on application ports`);
        }
      }
    }
  }
});
