/* eslint-disable max-classes-per-file, max-lines-per-function, complexity */
import chalk, { Chalk } from 'chalk';
import { ITask } from './Task';

interface LogEntrySettings {
  message: string;
  message_color?: Chalk;
  label?: string;
  label_color?: Chalk;
}

class LogEntry {
  public message: string;
  public message_color: Chalk;
  public label: string;
  public label_color: Chalk;

  constructor (settings: LogEntrySettings) {
    this.message = settings.message;
    this.message_color = settings.message_color || chalk.white;
    this.label = settings.label || '';
    this.label_color = settings.label_color || chalk.white;
  }

  public print () {
    if (this.label.length > 0) {
      process.stdout.write (this.label_color (this.label));
      process.stdout.write (' ');
    }
    process.stdout.write (this.message_color (this.message));
    process.stdout.write ('\n');
  }
}

export class TaskListVertical {
  public tasks: ITask[] = [];
  private interval: NodeJS.Timeout | null = null;
  private space_used = 0;
  private log_entries: LogEntry[] = [];
  private is_running = false;
  public isTTY;

  constructor () {
    this.isTTY = process.stderr.isTTY;
    if (!this.isTTY) {
      process.stderr.write (
        'Tasks: started on non-TTY terminal. '
        + 'No progress will be shown.\n'
      );
    }
  }

  private print_logs () {
    let count = 0;

    for (const entry of this.log_entries) {
      if (count < this.tasks.length && process.stdout.isTTY)
        process.stdout.write ('\u001b[K');

      entry.print ();
      count++;
    }

    this.log_entries = [];
  }

  public log (entry: LogEntrySettings | string) {
    let settings = entry;
    if (typeof settings === 'string')
      settings = { message: settings };

    const lines = String(settings.message).split ('\n');

    this.log_entries.push (
      ...lines.map (
        (msg) => new LogEntry ({ ...(settings as object), message: msg })
      )
    );
  }

  public update () {
    let completed = 0;
    for (const task of this.tasks) {
      if (!task.present_completed)
        break;
      completed++;
    }

    const available_space: number
      = typeof process.stdout.rows === 'number' && process.stdout.rows > 0
        ? process.stdout.rows - 1
        : this.tasks.length;

    let move_up = 0;
    const has_logs = this.log_entries.length > 0;

    if (!this.is_running)
      move_up = 0;
    else if (has_logs)
      move_up = this.tasks.length;
    else
      move_up = Math.min (this.space_used, this.tasks.length - completed);

    move_up = Math.min (move_up, available_space);

    if (move_up > 0 && this.isTTY)
      process.stderr.write (`\u001b[${move_up}A`);

    if (has_logs)
      this.print_logs ();

    if (this.isTTY) {
      this.space_used = has_logs ? 0 : completed;
      for (
        let i = this.space_used;
        i < Math.min (this.tasks.length, available_space + completed);
        i++
      ) {
        this.tasks[i].present ();
        process.stderr.write ('\u001b[K\n');
        this.space_used++;
      }
    }
    else {
      for (const task of this.tasks)
        task.present_completed = task.completed;
    }

    if (this.tasks.length === completed && this.interval !== null) {
      clearInterval (this.interval);
      this.interval = null;
      if (this.isTTY)
        process.stderr.write ('\x1b[?25h');
      this.is_running = false;
    }
    else if (this.interval === null) {
      this.interval = setInterval (() => this.update (), 100);
      if (this.isTTY)
        process.stderr.write ('\x1b[?25l');
      this.is_running = true;
    }
  }

  public async await_end (): Promise<void> {
    while (this.interval !== null)
      // eslint-disable-next-line no-await-in-loop
      await new Promise ((resolve) => setTimeout (resolve, 100));
  }
}
