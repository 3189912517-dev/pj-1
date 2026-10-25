import { Shape } from './Shape.js';

export class Line extends Shape {
  constructor(id: string, attributes: Readonly<Record<string, string>> = {}) {
    super(id, attributes, ['x1', 'y1', 'x2', 'y2']);
  }
  override get tag(): string { return 'line'; }
  override move(dx: number, dy: number): void { this.shift({ x1: dx, y1: dy, x2: dx, y2: dy }); }
  override get geometrySummary(): string {
    return `(${this.value('x1')},${this.value('y1')}) -> (${this.value('x2')},${this.value('y2')})`;
  }
  override clone(): Line { return new Line(this.id, this.attributes); }
}
