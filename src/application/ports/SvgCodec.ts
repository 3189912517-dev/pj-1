import type { SvgDocument } from '../../domain/SvgDocument.js';

export interface DecodedSvg {
  readonly document: SvgDocument;
  readonly warnings: readonly string[];
}

export interface SvgCodec {
  decode(source: string): DecodedSvg;
  encode(document: SvgDocument): string;
}
