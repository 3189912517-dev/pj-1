import { Arguments } from '../Arguments.js';
import { EditorSession } from '../EditorSession.js';
import { Command } from './Command.js';

export class UndoCommand extends Command {
  readonly name = 'undo';
  readonly syntax = 'undo';
  override execute(session: EditorSession, args: Arguments): string { args.expect(0); return session.undo(); }
}
