import { Group } from './shapes/Group.js';
import { Shape } from './shapes/Shape.js';
import { SvgValue } from './SvgValue.js';

export class SvgDocument {
  private root = new Group('@canvas');
  private canvasWidth: number;
  private canvasHeight: number;
  private extra: Readonly<Record<string, string>>;

  constructor(width = 800, height = 600, attributes: Readonly<Record<string, string>> = {}) {
    this.canvasWidth = SvgValue.positive(width, 'canvas width');
    this.canvasHeight = SvgValue.positive(height, 'canvas height');
    this.extra = Object.freeze({ ...attributes });
  }

  get width(): number { return this.canvasWidth; }
  get height(): number { return this.canvasHeight; }
  get attributes(): Readonly<Record<string, string>> { return this.extra; }
  get children(): readonly Shape[] { return this.root.children; }
  get elements(): readonly Shape[] { return this.root.children.flatMap(shape => shape.walk()); }
  get count(): number { return this.elements.length; }

  resize(width: number, height: number): void {
    const w = SvgValue.positive(width, 'canvas width');
    const h = SvgValue.positive(height, 'canvas height');
    this.canvasWidth = w; this.canvasHeight = h;
    this.extra = Object.freeze({ ...this.extra, viewBox: `0 0 ${w} ${h}` });
  }

  find(id: string): Shape {
    const result = this.elements.find(shape => shape.id === id);
    if (!result) throw new Error(`no such shape: ${id}`);
    return result;
  }

  assertAvailable(id: string): void {
    SvgValue.id(id);
    if (this.extra.id === id || this.elements.some(shape => shape.id === id)) throw new Error(`id already exists: ${id}`);
  }

  container(id: string): Group {
    const result = this.elements.find(shape => shape.id === id);
    if (!result) throw new Error(`no such container: ${id}`);
    if (!(result instanceof Group)) throw new Error(`not a container: ${id}`);
    return result;
  }

  parentOf(shape: Shape): Group {
    const parent = [this.root, ...this.elements].find(node => node instanceof Group && node.children.includes(shape));
    if (!(parent instanceof Group)) throw new Error(`no such shape: ${shape.id}`);
    return parent;
  }

  parentLabel(shape: Shape): string {
    const parent = this.parentOf(shape);
    return parent === this.root ? 'svg' : parent.label;
  }

  add(shape: Shape, containerId?: string): void {
    const reserved = new Set<string>();
    for (const node of shape.walk()) {
      this.assertAvailable(node.id);
      if (reserved.has(node.id)) throw new Error(`id already exists: ${node.id}`);
      reserved.add(node.id);
    }
    (containerId === undefined ? this.root : this.container(containerId)).insert(shape);
  }

  delete(id: string): Shape {
    const shape = this.find(id);
    this.parentOf(shape).remove(shape);
    return shape;
  }

  group(id: string, ids: readonly string[]): Group {
    this.assertAvailable(id);
    if (!ids.length) throw new Error('group requires at least one shape');
    if (new Set(ids).size !== ids.length) throw new Error('duplicate group member');
    const requested = ids.map(value => this.find(value));
    for (const shape of requested) {
      if (requested.some(other => other !== shape && shape.contains(other))) {
        throw new Error(`cannot group a container into its own descendant: ${shape.id}`);
      }
    }
    // Preserve document traversal order, independent of argument order.
    const selected = this.elements.filter(shape => requested.includes(shape));
    const first = selected[0]!;
    const parent = this.parentOf(first);
    const insertion = parent.children.indexOf(first);
    const group = new Group(id);
    for (const shape of selected) { this.parentOf(shape).remove(shape); group.insert(shape); }
    parent.insert(group, insertion);
    return group;
  }

  ungroup(id: string): void {
    const group = this.container(id);
    const parent = this.parentOf(group);
    if (parent === this.root) throw new Error(`cannot ungroup top-level container: ${id}`);
    const index = parent.remove(group);
    group.children.forEach((shape, offset) => { group.remove(shape); parent.insert(shape, index + offset); });
  }

  addTo(containerId: string, id: string): Shape {
    const group = this.container(containerId);
    const shape = this.find(id);
    if (shape.contains(group)) throw new Error(`cannot group a container into its own descendant: ${id}`);
    this.parentOf(shape).remove(shape);
    group.insert(shape);
    return shape;
  }

  order(id: string, front: boolean): Shape {
    const shape = this.find(id);
    const parent = this.parentOf(shape);
    parent.remove(shape);
    parent.insert(shape, front ? parent.children.length : 0);
    return shape;
  }

  clone(): SvgDocument {
    const copy = new SvgDocument(this.width, this.height, this.extra);
    copy.root = this.root.clone();
    return copy;
  }
}
