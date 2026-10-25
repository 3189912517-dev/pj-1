import { randomUUID } from 'node:crypto';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import type { FileStore } from '../application/ports/FileStore.js';

export class FileSystemStore implements FileStore {
  async read(path: string): Promise<string> {
    try { return await readFile(path, 'utf8'); }
    catch { throw new Error(`cannot read file: ${path}`); }
  }

  async write(path: string, content: string): Promise<void> {
    const destination = resolve(path);
    const temporary = join(dirname(destination), `.${basename(destination)}.${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx' });
      await rename(temporary, destination);
    } catch {
      await rm(temporary, { force: true }).catch(() => undefined);
      throw new Error(`cannot write file: ${path}`);
    }
  }
}
