import type { DecodedSvg, SvgCodec } from '../../src/application/ports/SvgCodec.js';
import { SvgDocument } from '../../src/domain/SvgDocument.js';

export class StubCodec implements SvgCodec {
  decode(source: string): DecodedSvg {
    if (source === 'invalid') throw new Error('invalid SVG');
    return { document: new SvgDocument(400, 300), warnings: [] };
  }
  encode(document: SvgDocument): string { return JSON.stringify(document.elements.map(shape => shape.summary)); }
}
