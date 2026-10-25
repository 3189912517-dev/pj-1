import { SvgDocument } from '../../domain/SvgDocument.js';
import { Arguments } from '../Arguments.js';
import { EditCommand } from './EditCommand.js';

export class AddToCommand extends EditCommand {
  readonly name = 'addto';
  readonly syntax = 'addto <gid> <id>';
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(2);
    return `${document.addTo(args.text(0), args.text(1)).label} moved into g#${args.text(0)}`;
  }
}
