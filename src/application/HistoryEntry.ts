import { SvgDocument } from '../domain/SvgDocument.js';

export class HistoryEntry {
  private readonly previous: SvgDocument;
  private readonly next: SvgDocument;
  constructor(before: SvgDocument, after: SvgDocument, private readonly description: string) {
    this.previous = before.clone();
    this.next = after.clone();
  }
  get summary(): string { return this.description; }
  before(): SvgDocument { return this.previous.clone(); }
  after(): SvgDocument { return this.next.clone(); }
}
