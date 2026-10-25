import { SvgDocument } from '../../domain/SvgDocument.js';
import { Arguments } from '../Arguments.js';
import { EditCommand } from './EditCommand.js';

export class DeleteCommand extends EditCommand {
  readonly name = 'delete';
  readonly syntax = 'delete <id>';
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(1);
    return `${document.delete(args.text(0)).label} deleted`;
  }
}
