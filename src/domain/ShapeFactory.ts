import { Circle } from './shapes/Circle.js';
import { Ellipse } from './shapes/Ellipse.js';
import { Group } from './shapes/Group.js';
import { Line } from './shapes/Line.js';
import { Rect } from './shapes/Rect.js';
import { Shape } from './shapes/Shape.js';
import { Text } from './shapes/Text.js';

interface Definition {
  readonly build: (id: string, attributes: Readonly<Record<string, string>>, content?: string) => Shape;
  readonly parameters: readonly string[];
  readonly paint?: string;
}

export class ShapeFactory {
  // Phase 1's single type-name dispatch point. Future providers can replace this registry.
  private readonly definitions = new Map<string, Definition>([
    ['rect', { build: (id, attrs) => new Rect(id, attrs), parameters: ['x', 'y', 'width', 'height'], paint: 'fill' }],
    ['circle', { build: (id, attrs) => new Circle(id, attrs), parameters: ['cx', 'cy', 'r'], paint: 'fill' }],
    ['ellipse', { build: (id, attrs) => new Ellipse(id, attrs), parameters: ['cx', 'cy', 'rx', 'ry'], paint: 'fill' }],
    ['line', { build: (id, attrs) => new Line(id, attrs), parameters: ['x1', 'y1', 'x2', 'y2'], paint: 'stroke' }],
    ['text', { build: (id, attrs, content) => new Text(id, attrs, content), parameters: ['x', 'y', 'text'] }],
    ['g', { build: (id, attrs) => new Group(id, attrs), parameters: [] }],
  ]);

  private definition(type: string): Definition {
    const result = this.definitions.get(type);
    if (!result) throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    return result;
  }

  create(type: string, id: string, values: readonly string[]): Shape {
    const definition = this.definition(type);
    const minimum = definition.parameters.length;
    if (values.length < minimum || values.length > minimum + (definition.paint ? 1 : 0)) {
      throw new Error(`invalid parameters for ${type}: expected ${definition.parameters.join(' ')}${definition.paint ? ` [${definition.paint}]` : ''}`);
    }
    const attributes: Record<string, string> = {};
    definition.parameters.forEach((key, index) => { if (key !== 'text') attributes[key] = values[index]!; });
    if (definition.paint && values.length > minimum) attributes[definition.paint] = values[minimum]!;
    const textIndex = definition.parameters.indexOf('text');
    return definition.build(id, attributes, textIndex < 0 ? undefined : values[textIndex]);
  }

  fromSvg(type: string, id: string, attributes: Readonly<Record<string, string>>, content: string): Shape {
    return this.definition(type).build(id, attributes, content);
  }
}
