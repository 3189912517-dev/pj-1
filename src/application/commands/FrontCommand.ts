import { SvgDocument } from '../../domain/SvgDocument.js';
import { Arguments } from '../Arguments.js';
import { EditCommand } from './EditCommand.js';

export class FrontCommand extends EditCommand {
  readonly name = 'front';
  readonly syntax = 'front <id>';
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(1);
    return `${document.order(args.text(0), true).label} moved to front`;
  }
}
