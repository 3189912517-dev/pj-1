import { SvgDocument } from '../../domain/SvgDocument.js';
import { Arguments } from '../Arguments.js';
import { EditCommand } from './EditCommand.js';

export class UngroupCommand extends EditCommand {
  readonly name = 'ungroup';
  readonly syntax = 'ungroup <gid>';
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(1);
    document.ungroup(args.text(0));
    return `g#${args.text(0)} ungrouped`;
  }
}
