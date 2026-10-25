import { Arguments } from '../Arguments.js';
import { EditorSession } from '../EditorSession.js';
import { Command } from './Command.js';

export class SaveCommand extends Command {
  readonly name = 'save';
  readonly syntax = 'save [file.svg]';
  override execute(session: EditorSession, args: Arguments): Promise<string> {
    args.expect(0, 1);
    return session.save(args.length ? args.text(0) : undefined);
  }
}
