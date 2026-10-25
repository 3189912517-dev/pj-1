import { Arguments } from '../Arguments.js';
import { EditorSession } from '../EditorSession.js';
import { Command } from './Command.js';

export class CanvasCommand extends Command {
  readonly name = 'canvas';
  readonly syntax = 'canvas [w h]';
  override execute(session: EditorSession, args: Arguments): string {
    if (args.length !== 0 && args.length !== 2) throw new Error('usage: canvas [w h]');
    return args.length ? session.canvas(args.number(0), args.number(1)) : session.canvas();
  }
}
