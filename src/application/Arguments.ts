import { SvgValue } from '../domain/SvgValue.js';

export interface Token {
  readonly value: string;
  readonly quoted: boolean;
}

export class Arguments {
  constructor(private readonly tokens: readonly Token[]) {}
  get length(): number { return this.tokens.length; }

  expect(minimum: number, maximum = minimum): void {
    if (this.length < minimum || this.length > maximum) {
      throw new Error(`expected ${minimum === maximum ? minimum : `${minimum}..${maximum}`} argument(s), got ${this.length}`);
    }
  }

  text(index: number): string {
    const token = this.tokens[index];
    if (!token) throw new Error(`missing argument ${index + 1}`);
    return token.value;
  }

  number(index: number): number { return SvgValue.number(this.text(index)); }
  isKeyword(index: number, word: string): boolean {
    const token = this.tokens[index];
    return token !== undefined && !token.quoted && token.value === word;
  }
  values(start = 0, end = this.length): readonly string[] { return this.tokens.slice(start, end).map(token => token.value); }
}
