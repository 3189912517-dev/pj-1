import { Arguments } from '../Arguments.js';
import { DocumentView } from '../DocumentView.js';
import { EditorSession } from '../EditorSession.js';
import { Command } from './Command.js';

export class TreeCommand extends Command {
  readonly name = 'tree';
  readonly syntax = 'tree [id]';
  override execute(session: EditorSession, args: Arguments): string {
    args.expect(0, 1);
    return new DocumentView().tree(session.document, args.length ? args.text(0) : undefined);
  }
}
