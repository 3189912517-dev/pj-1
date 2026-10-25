import { CommandDispatcher } from '../application/CommandDispatcher.js';
import { Tokenizer } from './Tokenizer.js';

export class CommandLine {
  private readonly tokenizer = new Tokenizer();
  constructor(private readonly dispatcher: CommandDispatcher) {}
  async execute(line: string): Promise<string> {
    try { return await this.dispatcher.execute(this.tokenizer.tokenize(line)); }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `error: ${message.replace(/[\r\n]+/g, ' ')}`;
    }
  }
}
