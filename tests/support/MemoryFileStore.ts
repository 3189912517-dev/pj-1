import type { FileStore } from '../../src/application/ports/FileStore.js';

export class MemoryFileStore implements FileStore {
  private readonly files = new Map<string, string>();
  private blockedPath?: string;
  deny(path: string): void { this.blockedPath = path; }
  async read(path: string): Promise<string> {
    const content = this.files.get(path);
    if (content === undefined || path === this.blockedPath) throw new Error(`cannot read file: ${path}`);
    return content;
  }
  async write(path: string, content: string): Promise<void> {
    if (path === this.blockedPath) throw new Error(`cannot write file: ${path}`);
    this.files.set(path, content);
  }
}
