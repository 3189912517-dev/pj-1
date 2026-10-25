import { DOMImplementation, DOMParser, XMLSerializer, type Document, type Element, type Node } from '@xmldom/xmldom';
import type { DecodedSvg, SvgCodec } from '../application/ports/SvgCodec.js';
import { ShapeFactory } from '../domain/ShapeFactory.js';
import { SvgDocument } from '../domain/SvgDocument.js';
import { SvgValue } from '../domain/SvgValue.js';
import { Group } from '../domain/shapes/Group.js';
import { Shape } from '../domain/shapes/Shape.js';

export class XmlSvgCodec implements SvgCodec {
  private readonly namespace = 'http://www.w3.org/2000/svg';
  constructor(private readonly factory = new ShapeFactory()) {}

  decode(source: string): DecodedSvg {
    SvgValue.text(source);
    if (/<!DOCTYPE/i.test(source)) throw new Error('unsupported SVG: DOCTYPE is not supported');
    let xml: Document;
    try {
      xml = new DOMParser({ onError: (_level, message) => { throw new Error(message); } })
        .parseFromString(source, 'application/xml');
    } catch { throw new Error('invalid SVG: malformed XML'); }
    const root = xml.documentElement;
    if (!root || root.localName !== 'svg' || (root.namespaceURI && root.namespaceURI !== this.namespace)) {
      throw new Error('invalid SVG: expected <svg> root');
    }
    const attributes = this.attributes(root);
    const viewBox = attributes.viewBox?.trim().split(/[\s,]+/).map(value => SvgValue.number(value, 'viewBox'));
    if (viewBox && (viewBox.length !== 4 || viewBox[2]! <= 0 || viewBox[3]! <= 0)) throw new Error('invalid viewBox');
    const width = this.length(attributes.width, viewBox?.[2] ?? 800, 'canvas width');
    const height = this.length(attributes.height, viewBox?.[3] ?? 600, 'canvas height');
    const document = new SvgDocument(width, height, attributes);
    const reserved = new Set<string>();
    for (const element of [root, ...Array.from(root.getElementsByTagName('*'))]) {
      const id = element.getAttribute('id');
      if (id === null || id === '') continue;
      SvgValue.id(id);
      if (reserved.has(id)) throw new Error(`id already exists: ${id}`);
      reserved.add(id);
    }
    const warnings: string[] = [];
    for (const child of this.elementChildren(root)) document.add(this.readShape(child, reserved, warnings));
    return { document, warnings };
  }

  private length(value: string | undefined, fallback: number, name: string): number {
    return value === undefined ? fallback : SvgValue.positive(value.trim().replace(/px$/, ''), name);
  }

  private attributes(element: Element): Record<string, string> {
    const result: Record<string, string> = Object.create(null) as Record<string, string>;
    for (const attribute of Array.from(element.attributes)) result[attribute.name] = attribute.value;
    return result;
  }

  private elementChildren(element: Element): Element[] {
    const result: Element[] = [];
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === 1) result.push(node as Element);
      else if ((node.nodeType === 3 || node.nodeType === 4) && node.textContent?.trim()) {
        throw new Error(`unsupported SVG: unexpected text inside <${element.localName}>`);
      }
    }
    return result;
  }

  private readShape(element: Element, reserved: Set<string>, warnings: string[]): Shape {
    if (element.namespaceURI && element.namespaceURI !== this.namespace) throw new Error(`unsupported namespace: ${element.namespaceURI}`);
    const type = element.localName ?? element.tagName;
    let id = element.getAttribute('id');
    if (!id) {
      let index = 1;
      while (reserved.has(`${type}${index}`)) index++;
      id = `${type}${index}`;
      reserved.add(id);
      warnings.push(`warning: assigned id ${id} to unnamed <${type}>`);
    }
    const shape = this.factory.fromSvg(type, id, this.attributes(element), '');
    if (shape instanceof Group) {
      for (const child of this.elementChildren(element)) shape.insert(this.readShape(child, reserved, warnings));
    } else if (shape.content !== undefined) {
      let content = '';
      for (const node of Array.from(element.childNodes)) {
        if (node.nodeType === 1) throw new Error('unsupported SVG: nested markup in text');
        if (node.nodeType === 3 || node.nodeType === 4) content += node.textContent ?? '';
      }
      shape.set('text', content);
    } else if (this.elementChildren(element).length) {
      throw new Error(`unsupported SVG: children inside <${type}>`);
    }
    return shape;
  }

  encode(document: SvgDocument): string {
    const xml = new DOMImplementation().createDocument(this.namespace, 'svg', null);
    const root = xml.documentElement!;
    this.writeAttributes(root, document.attributes);
    root.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', this.namespace);
    root.setAttribute('width', String(document.width));
    root.setAttribute('height', String(document.height));
    root.setAttribute('viewBox', document.attributes.viewBox ?? `0 0 ${document.width} ${document.height}`);
    this.writeChildren(xml, root, document.children, 1);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(xml, { requireWellFormed: true })}\n`;
  }

  private writeAttributes(element: Element, attributes: Readonly<Record<string, string>>): void {
    for (const [name, value] of Object.entries(attributes)) {
      if (name === 'xmlns' || name.startsWith('xmlns:')) {
        element.setAttributeNS('http://www.w3.org/2000/xmlns/', name, value);
      } else element.setAttribute(name, value);
    }
  }

  private writeChildren(xml: Document, parent: Node, shapes: readonly Shape[], depth: number): void {
    for (const shape of shapes) {
      parent.appendChild(xml.createTextNode(`\n${'  '.repeat(depth)}`));
      const element = xml.createElementNS(this.namespace, shape.tag);
      parent.appendChild(element);
      element.setAttribute('id', shape.id);
      this.writeAttributes(element, shape.attributes);
      if (shape.content !== undefined) element.appendChild(xml.createTextNode(shape.content));
      else this.writeChildren(xml, element, shape.children, depth + 1);
    }
    if (shapes.length) parent.appendChild(xml.createTextNode(`\n${'  '.repeat(depth - 1)}`));
  }
}
