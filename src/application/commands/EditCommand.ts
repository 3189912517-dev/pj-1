import { SvgDocument } from '../../domain/SvgDocument.js';
import { Arguments } from '../Arguments.js';
import { EditorSession } from '../EditorSession.js';
import { Command } from './Command.js';

export abstract class EditCommand extends Command {
  override execute(session: EditorSession, args: Arguments): string {
    return session.edit(document => this.apply(document, args));
  }
  protected abstract apply(document: SvgDocument, args: Arguments): string;
}
