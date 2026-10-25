import { Arguments } from '../Arguments.js';
import { DocumentView } from '../DocumentView.js';
import { EditorSession } from '../EditorSession.js';
import { Command } from './Command.js';

export class ShowCommand extends Command {
  readonly name = 'show';
  readonly syntax = 'show <id>';
  override execute(session: EditorSession, args: Arguments): string {
    args.expect(1);
    return new DocumentView().show(session.document, args.text(0));
  }
}
