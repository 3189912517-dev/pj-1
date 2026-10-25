import { Arguments } from '../Arguments.js';
import { EditorSession } from '../EditorSession.js';
import { Command } from './Command.js';

export class HelpCommand extends Command {
  readonly name = 'help';
  readonly syntax = 'help';
  constructor(private readonly usages: () => readonly string[]) { super(); }
  override execute(_session: EditorSession, args: Arguments): string {
    args.expect(0);
    return [
      ...this.usages(),
      '',
      'Types:',
      '  rect <id> <x> <y> <w> <h> [fill]',
      '  circle <id> <cx> <cy> <r> [fill]',
      '  ellipse <id> <cx> <cy> <rx> <ry> [fill]',
      '  line <id> <x1> <y1> <x2> <y2> [stroke]',
      '  text <id> <x> <y> "content"',
      '  g <id>',
      'All create forms accept a trailing in <containerId>.',
      'set: fill, stroke, stroke-width, shape geometry; text also accepts text.',
      'Lines beginning with # are comments; use double quotes around spaces.',
      'End input with EOF, or press Ctrl+C to exit.',
    ].join('\n');
  }
}
