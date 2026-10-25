import { Shape } from './Shape.js';

export class Circle extends Shape {
  constructor(id: string, attributes: Readonly<Record<string, string>> = {}) {
    super(id, attributes, ['cx', 'cy', 'r'], ['r']);
  }
  override get tag(): string { return 'circle'; }
  override move(dx: number, dy: number): void { this.shift({ cx: dx, cy: dy }); }
  override get geometrySummary(): string {
    return `cx=${this.value('cx')} cy=${this.value('cy')} r=${this.value('r')}`;
  }
  override clone(): Circle { return new Circle(this.id, this.attributes); }
}
