import { Arguments } from '../Arguments.js';
import { EditorSession } from '../EditorSession.js';
import { Command } from './Command.js';

export class RedoCommand extends Command {
  readonly name = 'redo';
  readonly syntax = 'redo';
  override execute(session: EditorSession, args: Arguments): string { args.expect(0); return session.redo(); }
}
