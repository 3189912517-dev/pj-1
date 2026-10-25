import { SvgDocument } from '../../domain/SvgDocument.js';
import { Arguments } from '../Arguments.js';
import { EditCommand } from './EditCommand.js';

export class GroupCommand extends EditCommand {
  readonly name = 'group';
  readonly syntax = 'group <newGid> <id1> [id2...]';
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(2, Number.MAX_SAFE_INTEGER);
    const group = document.group(args.text(0), args.values(1));
    return `${group.label} created with ${group.children.length} children`;
  }
}
