import { SvgDocument } from '../../domain/SvgDocument.js';
import { Arguments } from '../Arguments.js';
import { EditCommand } from './EditCommand.js';

export class SetCommand extends EditCommand {
  readonly name = 'set';
  readonly syntax = 'set <id> <attr> <value>';
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(3);
    const shape = document.find(args.text(0));
    shape.set(args.text(1), args.text(2));
    return `${shape.label} updated: ${args.text(1)}=${JSON.stringify(args.text(2))}`;
  }
}
