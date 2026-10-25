import { SvgDocument } from '../domain/SvgDocument.js';
import { HistoryEntry } from './HistoryEntry.js';

export class CommandHistory {
  private readonly past: HistoryEntry[] = [];
  private readonly future: HistoryEntry[] = [];
  private blocked = true;

  record(before: SvgDocument, after: SvgDocument, summary: string): void {
    const entry = new HistoryEntry(before, after, summary);
    this.past.push(entry);
    this.future.length = 0;
    this.blocked = false;
  }

  barrier(): void {
    this.past.length = 0; this.future.length = 0; this.blocked = true;
  }

  private ensureAllowed(): void {
    if (this.blocked) throw new Error('undo not allowed after io command');
  }

  undo(): HistoryEntry {
    this.ensureAllowed();
    const entry = this.past.pop();
    if (!entry) throw new Error('nothing to undo');
    this.future.push(entry);
    return entry;
  }

  redo(): HistoryEntry {
    this.ensureAllowed();
    const entry = this.future.pop();
    if (!entry) throw new Error('nothing to redo');
    this.past.push(entry);
    return entry;
  }
}
