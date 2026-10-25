import { SvgValue } from '../SvgValue.js';

export abstract class Shape {
  private readonly identity: string;
  private readonly properties: Map<string, string>;

  protected constructor(
    id: string,
    attributes: Readonly<Record<string, string>>,
    private readonly geometry: readonly string[],
    private readonly dimensions: readonly string[] = [],
  ) {
    this.identity = SvgValue.id(id);
    this.properties = new Map();
    for (const [key, value] of Object.entries(attributes)) {
      if (key !== 'id') this.properties.set(key, SvgValue.text(value));
    }
    for (const key of geometry) this.set(key, attributes[key] ?? '0');
    if (attributes['stroke-width'] !== undefined) this.set('stroke-width', attributes['stroke-width']);
  }

  get id(): string { return this.identity; }
  abstract get tag(): string;
  get label(): string { return `${this.tag}#${this.id}`; }
  get attributes(): Readonly<Record<string, string>> { return Object.freeze(Object.fromEntries(this.properties)); }
  get content(): string { return ''; }
  get children(): readonly Shape[] { return []; }

  set(attribute: string, value: string): void {
    if (this.geometry.includes(attribute) || attribute === 'stroke-width') {
      const result = this.dimensions.includes(attribute) || attribute === 'stroke-width'
        ? SvgValue.nonnegative(value, attribute) : SvgValue.number(value, attribute);
      this.properties.set(attribute, String(result));
      return;
    }
    if (attribute === 'fill' || attribute === 'stroke') {
      this.properties.set(attribute, SvgValue.text(value));
      return;
    }
    throw new Error(`unknown attribute: ${attribute}`);
  }

  abstract move(dx: number, dy: number): void;

  scale(factor: number): void {
    SvgValue.positive(factor, 'scale factor');
    for (const key of this.geometry) this.set(key, String(this.number(key) * factor));
  }

  protected shift(offsets: Readonly<Record<string, number>>): void {
    for (const [key, offset] of Object.entries(offsets)) {
      this.set(key, String(this.number(key) + SvgValue.number(offset)));
    }
  }

  protected number(attribute: string): number { return Number(this.properties.get(attribute)); }
  protected value(attribute: string): string { return this.properties.get(attribute) ?? ''; }
  protected paint(): string {
    return ['fill', 'stroke', 'stroke-width'].filter(key => this.properties.has(key))
      .map(key => `${key}=${this.value(key)}`).join(' ');
  }

  abstract get geometrySummary(): string;
  get summary(): string { return [this.label, this.geometrySummary, this.paint()].filter(Boolean).join(' '); }
  contains(shape: Shape): boolean { return this === shape; }
  walk(): readonly Shape[] { return [this]; }
  abstract clone(): Shape;
}
