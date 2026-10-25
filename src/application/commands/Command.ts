import { Arguments } from '../Arguments.js';
import { EditorSession } from '../EditorSession.js';

export abstract class Command {
  abstract readonly name: string;
  abstract readonly syntax: string;
  abstract execute(session: EditorSession, args: Arguments): string | Promise<string>;
}
