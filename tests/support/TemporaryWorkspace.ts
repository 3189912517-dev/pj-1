import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { basename, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export class TemporaryWorkspace {
  private constructor(private readonly directory: string, private readonly base: string) {}
  get path(): string { return this.directory; }

  static async create(): Promise<TemporaryWorkspace> {
    const base = resolve(fileURLToPath(new URL('../../.tmp/', import.meta.url)));
    await mkdir(base, { recursive: true });
    return new TemporaryWorkspace(await mkdtemp(`${base}${sep}test-`), base);
  }

  async dispose(): Promise<void> {
    const target = resolve(this.directory);
    if (!target.startsWith(`${this.base}${sep}`) || !basename(target).startsWith('test-')) throw new Error('unsafe test cleanup path');
    await rm(target, { recursive: true, force: true });
  }
}
