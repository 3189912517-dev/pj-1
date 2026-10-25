import { Arguments, type Token } from './Arguments.js';
import { EditorSession } from './EditorSession.js';
import { AddToCommand } from './commands/AddToCommand.js';
import { BackCommand } from './commands/BackCommand.js';
import { CanvasCommand } from './commands/CanvasCommand.js';
import { Command } from './commands/Command.js';
import { CreateCommand } from './commands/CreateCommand.js';
import { DeleteCommand } from './commands/DeleteCommand.js';
import { FrontCommand } from './commands/FrontCommand.js';
import { GroupCommand } from './commands/GroupCommand.js';
import { HelpCommand } from './commands/HelpCommand.js';
import { InitCommand } from './commands/InitCommand.js';
import { MoveCommand } from './commands/MoveCommand.js';
import { ReadCommand } from './commands/ReadCommand.js';
import { RedoCommand } from './commands/RedoCommand.js';
import { SaveCommand } from './commands/SaveCommand.js';
import { ScaleCommand } from './commands/ScaleCommand.js';
import { SetCommand } from './commands/SetCommand.js';
import { ShowCommand } from './commands/ShowCommand.js';
import { TreeCommand } from './commands/TreeCommand.js';
import { UndoCommand } from './commands/UndoCommand.js';
import { UngroupCommand } from './commands/UngroupCommand.js';

export class CommandDispatcher {
  private readonly commands: ReadonlyMap<string, Command>;
  constructor(private readonly session: EditorSession) {
    // Phase 1's single command-name dispatch point.
    const commands: Command[] = [
      new InitCommand(), new ReadCommand(), new SaveCommand(), new CanvasCommand(),
      new CreateCommand(), new DeleteCommand(), new MoveCommand(), new ScaleCommand(),
      new SetCommand(), new GroupCommand(), new UngroupCommand(), new AddToCommand(),
      new FrontCommand(), new BackCommand(), new TreeCommand(), new ShowCommand(),
      new UndoCommand(), new RedoCommand(),
      new HelpCommand(() => [...this.commands.values()].map(command => command.syntax)),
    ];
    this.commands = new Map(commands.map(command => [command.name, command]));
  }

  async execute(tokens: readonly Token[]): Promise<string> {
    if (!tokens.length) return '';
    const name = tokens[0]!.value;
    const command = this.commands.get(name);
    if (!command) throw new Error(`unknown command: ${name}`);
    return command.execute(this.session, new Arguments(tokens.slice(1)));
  }
}
