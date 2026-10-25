import { Shape } from './Shape.js';

export class Ellipse extends Shape {
  constructor(id: string, attributes: Readonly<Record<string, string>> = {}) {
    super(id, attributes, ['cx', 'cy', 'rx', 'ry'], ['rx', 'ry']);
  }
  override get tag(): string { return 'ellipse'; }
  override move(dx: number, dy: number): void { this.shift({ cx: dx, cy: dy }); }
  override get geometrySummary(): string {
    return `cx=${this.value('cx')} cy=${this.value('cy')} rx=${this.value('rx')} ry=${this.value('ry')}`;
  }
  override clone(): Ellipse { return new Ellipse(this.id, this.attributes); }
}
