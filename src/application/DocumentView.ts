import { SvgDocument } from '../domain/SvgDocument.js';
import { Shape } from '../domain/shapes/Shape.js';

export class DocumentView {
  tree(document: SvgDocument, id?: string): string {
    if (id !== undefined) {
      const shape = document.find(id);
      return [shape.summary, ...this.branches(shape.children, '')].join('\n');
    }
    return [`svg (${document.width}x${document.height})`, ...this.branches(document.children, '')].join('\n');
  }

  private branches(shapes: readonly Shape[], prefix: string): string[] {
    return shapes.flatMap((shape, index) => {
      const last = index === shapes.length - 1;
      return [
        `${prefix}${last ? '└── ' : '├── '}${shape.summary}`,
        ...this.branches(shape.children, `${prefix}${last ? '    ' : '│   '}`),
      ];
    });
  }

  show(document: SvgDocument, id: string): string {
    const shape = document.find(id);
    const lines = [`${shape.label}  parent=${document.parentLabel(shape)}`];
    for (const [key, value] of Object.entries(shape.attributes)) {
      lines.push(`  ${key}=${/[\s"<>]/.test(value) ? JSON.stringify(value) : value}`);
    }
    if (shape.content !== undefined) lines.push(`  text=${JSON.stringify(shape.content)}`);
    return lines.join('\n');
  }
}
