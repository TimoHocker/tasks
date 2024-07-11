/* eslint-disable max-classes-per-file */
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

  private print_logs () {
    let count = 0;

    for (const entry of this.log_entries) {
      if (count < this.tasks.length)
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

    this.log_entries.push (new LogEntry (settings));
  }

  public update () {
    let completed = 0;
    for (const task of this.tasks) {
      if (!task.present_completed)
        break;
      completed++;
    }

    let move_up = 0;
    const has_logs = this.log_entries.length > 0;

    if (!this.is_running)
      move_up = 0;
    else if (has_logs)
      move_up = this.tasks.length;
    else
      move_up = Math.min (this.space_used, this.tasks.length - completed);

    if (move_up > 0)
      process.stderr.write (`\u001b[${move_up}A`);

    if (has_logs)
      this.print_logs ();

    this.space_used = has_logs ? 0 : completed;
    for (let i = this.space_used; i < this.tasks.length; i++) {
      this.tasks[i].present ();
      process.stderr.write ('\u001b[K\n');
      this.space_used++;
    }

    if (this.tasks.length === completed && this.interval !== null) {
      clearInterval (this.interval);
      this.interval = null;
      process.stderr.write ('\x1b[?25h');
      this.is_running = false;
    }
    else if (this.interval === null) {
      this.interval = setInterval (() => this.update (), 100);
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
