import { SvgDocument } from '../domain/SvgDocument.js';
import { CommandHistory } from './CommandHistory.js';
import type { FileStore } from './ports/FileStore.js';
import type { SvgCodec } from './ports/SvgCodec.js';

export class EditorSession {
  private current?: SvgDocument;
  private filePath?: string;
  private readonly history = new CommandHistory();

  constructor(private readonly files: FileStore, private readonly codec: SvgCodec) {}

  get document(): SvgDocument {
    if (!this.current) throw new Error("no document. use 'init' or 'read' first");
    return this.current;
  }
  get path(): string | undefined { return this.filePath; }

  initialize(width = 800, height = 600): string {
    const document = new SvgDocument(width, height);
    this.current = document; this.filePath = undefined; this.history.barrier();
    return `canvas ${width}x${height} created`;
  }

  edit(change: (document: SvgDocument) => string): string {
    const before = this.document;
    const candidate = before.clone();
    const summary = change(candidate);
    // Nothing becomes visible, including history, until all edits succeed.
    this.history.record(before, candidate, summary);
    this.current = candidate;
    return summary;
  }

  undo(): string {
    this.document;
    const entry = this.history.undo();
    this.current = entry.before();
    return `undone: ${entry.summary}`;
  }

  redo(): string {
    this.document;
    const entry = this.history.redo();
    this.current = entry.after();
    return `redone: ${entry.summary}`;
  }

  canvas(width?: number, height?: number): string {
    const before = this.document;
    if (width === undefined || height === undefined) return `canvas ${before.width}x${before.height}`;
    const candidate = before.clone();
    candidate.resize(width, height);
    this.current = candidate; this.history.barrier();
    return `canvas resized to ${width}x${height}`;
  }

  async read(path: string): Promise<string> {
    const source = await this.files.read(path);
    const decoded = this.codec.decode(source);
    this.current = decoded.document; this.filePath = path; this.history.barrier();
    return [...decoded.warnings, `read ${path} (${decoded.document.count} elements)`].join('\n');
  }

  async save(path?: string): Promise<string> {
    const document = this.document;
    const destination = path ?? this.filePath;
    if (!destination) throw new Error('no file path. use save <file.svg>');
    await this.files.write(destination, this.codec.encode(document));
    this.filePath = destination; this.history.barrier();
    return `saved to ${destination} (${document.count} elements)`;
  }
}
