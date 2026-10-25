import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';
import { CommandLine } from './CommandLine.js';

export class Repl {
  constructor(
    private readonly commands: CommandLine,
    private readonly input: Readable,
    private readonly output: Writable,
    private readonly errors: Writable,
    private readonly interactive: boolean,
  ) {}

  async run(): Promise<number> {
    this.output.write("svg-editor 0.1 — type 'help' for commands\n");
    const reader = createInterface({ input: this.input, output: this.output, terminal: this.interactive, prompt: 'svg> ' });
    reader.on('SIGINT', () => reader.close());
    let failures = 0;
    if (this.interactive) reader.prompt();
    try {
      for await (const line of reader) {
        const result = await this.commands.execute(line);
        if (result) {
          const failed = result.startsWith('error:');
          if (failed) failures++;
          (failed ? this.errors : this.output).write(`${result}\n`);
        }
        if (this.interactive) reader.prompt();
      }
    } finally { reader.close(); }
    return failures;
  }
}
