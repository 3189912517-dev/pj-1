import { ShapeFactory } from '../../domain/ShapeFactory.js';
import { SvgDocument } from '../../domain/SvgDocument.js';
import { Arguments } from '../Arguments.js';
import { EditCommand } from './EditCommand.js';

export class CreateCommand extends EditCommand {
  readonly name = 'create';
  readonly syntax = 'create <type> <id> [params...] [in <containerId>]';
  constructor(private readonly factory = new ShapeFactory()) { super(); }
  protected override apply(document: SvgDocument, args: Arguments): string {
    args.expect(2, Number.MAX_SAFE_INTEGER);
    const hasContainer = args.length >= 4 && args.isKeyword(args.length - 2, 'in');
    const containerId = hasContainer ? args.text(args.length - 1) : undefined;
    const shape = this.factory.create(args.text(0), args.text(1), args.values(2, hasContainer ? args.length - 2 : args.length));
    document.add(shape, containerId);
    return `${shape.label} created${containerId !== undefined ? ` in g#${containerId}` : ''}`;
  }
}
