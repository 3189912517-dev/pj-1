import { Arguments } from '../Arguments.js';
import { EditorSession } from '../EditorSession.js';
import { Command } from './Command.js';

export class InitCommand extends Command {
  readonly name = 'init';
  readonly syntax = 'init [w] [h]';
  override execute(session: EditorSession, args: Arguments): string {
    args.expect(0, 2);
    return session.initialize(args.length > 0 ? args.number(0) : 800, args.length > 1 ? args.number(1) : 600);
  }
}
