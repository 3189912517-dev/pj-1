import { SvgValue } from '../SvgValue.js';
import { Shape } from './Shape.js';

export class Group extends Shape {
  private readonly nodes: Shape[] = [];
  constructor(id: string, attributes: Readonly<Record<string, string>> = {}) { super(id, attributes, []); }
  override get tag(): string { return 'g'; }
  override get children(): readonly Shape[] { return this.nodes.slice(); }
  override get geometrySummary(): string { return ''; }

  insert(shape: Shape, index = this.nodes.length): void {
    if (shape.contains(this) || this.contains(shape)) throw new Error(`cannot create cyclic or duplicate child: ${shape.id}`);
    if (!Number.isInteger(index) || index < 0 || index > this.nodes.length) throw new Error('invalid child index');
    this.nodes.splice(index, 0, shape);
  }

  remove(shape: Shape): number {
    const index = this.nodes.indexOf(shape);
    if (index < 0) throw new Error(`no such child: ${shape.id}`);
    this.nodes.splice(index, 1);
    return index;
  }

  override move(dx: number, dy: number): void {
    SvgValue.number(dx); SvgValue.number(dy);
    for (const shape of this.nodes) shape.move(dx, dy);
  }
  override scale(factor: number): void {
    super.scale(factor);
    for (const shape of this.nodes) shape.scale(factor);
  }
  override contains(shape: Shape): boolean { return super.contains(shape) || this.nodes.some(node => node.contains(shape)); }
  override walk(): readonly Shape[] { return [this, ...this.nodes.flatMap(node => node.walk())]; }
  override clone(): Group {
    const result = new Group(this.id, this.attributes);
    for (const shape of this.nodes) result.insert(shape.clone());
    return result;
  }
}
