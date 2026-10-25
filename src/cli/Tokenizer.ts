import type { Token } from '../application/Arguments.js';

export class Tokenizer {
  tokenize(line: string): readonly Token[] {
    if (line.trimStart().startsWith('#')) return [];
    const tokens: Token[] = [];
    let value = ''; let inQuote = false; let quoted = false; let started = false;
    for (let index = 0; index < line.length; index++) {
      const character = line[index]!;
      if (inQuote && character === '\\' && (line[index + 1] === '"' || line[index + 1] === '\\')) {
        value += line[++index]!; started = true;
      } else if (character === '"') {
        inQuote = !inQuote; quoted = true; started = true;
      } else if (!inQuote && /\s/.test(character)) {
        if (started) { tokens.push({ value, quoted }); value = ''; quoted = false; started = false; }
      } else { value += character; started = true; }
    }
    if (inQuote) throw new Error('unterminated double quote');
    if (started) tokens.push({ value, quoted });
    return tokens;
  }
}
