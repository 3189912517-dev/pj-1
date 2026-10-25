import { SvgDocument } from '../../domain/SvgDocument.js';
import { Arguments } from '../Arguments.js';
import { EditCommand } from './EditCommand.js';

export class BackCommand extends EditCommand {
  readonly name = 'back';
  readonly syntax = 'back <id>';
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(1);
    return `${document.order(args.text(0), false).label} moved to back`;
  }
}
