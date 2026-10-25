import { SvgDocument } from '../../domain/SvgDocument.js';
import { Arguments } from '../Arguments.js';
import { EditCommand } from './EditCommand.js';

export class ScaleCommand extends EditCommand {
  readonly name = 'scale';
  readonly syntax = 'scale <id> <factor>';
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(2);
    const shape = document.find(args.text(0));
    const factor = args.number(1);
    shape.scale(factor);
    return `${shape.label} scaled by ${factor}`;
  }
}
