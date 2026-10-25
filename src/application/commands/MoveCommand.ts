import { SvgDocument } from '../../domain/SvgDocument.js';
import { Arguments } from '../Arguments.js';
import { EditCommand } from './EditCommand.js';

export class MoveCommand extends EditCommand {
  readonly name = 'move';
  readonly syntax = 'move <id> <dx> <dy>';
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(3);
    const shape = document.find(args.text(0));
    const dx = args.number(1); const dy = args.number(2);
    shape.move(dx, dy);
    return `${shape.label} moved by (${dx},${dy})${shape.geometrySummary ? `: ${shape.geometrySummary}` : ''}`;
  }
}
