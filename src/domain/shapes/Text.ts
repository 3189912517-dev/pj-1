import { SvgValue } from '../SvgValue.js';
import { Shape } from './Shape.js';

export class Text extends Shape {
  private text: string;
  constructor(id: string, attributes: Readonly<Record<string, string>> = {}, content = '') {
    super(id, attributes, ['x', 'y']);
    this.text = SvgValue.text(content);
  }
  override get tag(): string { return 'text'; }
  override get content(): string { return this.text; }
  override set(attribute: string, value: string): void {
    if (attribute === 'text') { this.text = SvgValue.text(value); return; }
    super.set(attribute, value);
  }
  override move(dx: number, dy: number): void { this.shift({ x: dx, y: dy }); }
  override get geometrySummary(): string {
    return `(${this.value('x')},${this.value('y')}) ${JSON.stringify(this.text)}`;
  }
  override clone(): Text { return new Text(this.id, this.attributes, this.text); }
}
