import { Arguments } from '../Arguments.js';
import { EditorSession } from '../EditorSession.js';
import { Command } from './Command.js';

export class ReadCommand extends Command {
  readonly name = 'read';
  readonly syntax = 'read <file.svg>';
  override execute(session: EditorSession, args: Arguments): Promise<string> {
    args.expect(1);
    return session.read(args.text(0));
  }
}
