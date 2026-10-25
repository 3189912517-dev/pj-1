import { Shape } from './Shape.js';

export class Rect extends Shape {
  constructor(id: string, attributes: Readonly<Record<string, string>> = {}) {
    super(id, attributes, ['x', 'y', 'width', 'height'], ['width', 'height']);
  }
  override get tag(): string { return 'rect'; }
  override move(dx: number, dy: number): void { this.shift({ x: dx, y: dy }); }
  override get geometrySummary(): string {
    return `x=${this.value('x')} y=${this.value('y')} w=${this.value('width')} h=${this.value('height')}`;
  }
  override clone(): Rect { return new Rect(this.id, this.attributes); }
}
