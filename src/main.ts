import { Readable } from 'node:stream';
import { CommandDispatcher } from './application/CommandDispatcher.js';
import { EditorSession } from './application/EditorSession.js';
import { CommandLine } from './cli/CommandLine.js';
import { Repl } from './cli/Repl.js';
import { FileSystemStore } from './infrastructure/FileSystemStore.js';
import { XmlSvgCodec } from './infrastructure/XmlSvgCodec.js';

// Composition root: only this entrypoint selects concrete I/O adapters.
try {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--script')) throw new Error('usage: npm run cli -- [--script <commands.txt>]');
  const files = new FileSystemStore();
  const input = args.length ? Readable.from([await files.read(args[1]!)]) : process.stdin;
  const interactive = !args.length && Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const session = new EditorSession(files, new XmlSvgCodec());
  const repl = new Repl(new CommandLine(new CommandDispatcher(session)), input, process.stdout, process.stderr, interactive);
  const failures = await repl.run();
  if (!interactive && failures) process.exitCode = 1;
} catch (error) {
  process.stderr.write(`error: ${(error instanceof Error ? error.message : String(error)).replace(/[\r\n]+/g, ' ')}\n`);
  process.exitCode = 1;
}
