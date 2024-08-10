/* eslint-disable max-classes-per-file, max-lines-per-function, complexity */
import assert from 'assert';
import chalk, { Chalk } from 'chalk';
import debug from 'debug';
import { TaskList } from './TaskList';
import { OccupiedSpace } from './Space';

const log = debug ('sapphirecode:tasks:TaskListVertical');

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

export class TaskListVertical extends TaskList {
  private interval: NodeJS.Timeout | null = null;
  private log_entries: LogEntry[] = [];
  private is_running = false;
  public clear_completed = false;
  public isTTY;

  constructor () {
    super ();
    this.isTTY = process.stderr.isTTY;
    if (!this.isTTY) {
      process.stderr.write (
        'Tasks: started on non-TTY terminal. No progress will be shown.\n'
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

    const lines = String (settings.message)
      .split ('\n');

    const log_lines: string[] = [];

    const label = settings.label || '';
    const width = process.stdout.columns;

    if (typeof width === 'number' && width >= 4) {
      if (width > label.length) {
        for (const line of lines) {
          let remaining = line;
          while (remaining.length + label.length + 1 > width) {
            const split = remaining.slice (0, width - label.length - 1);
            log_lines.push (split);
            remaining = remaining.slice (width - label.length - 1);
          }
          log_lines.push (remaining);
        }
      }
      else {
        this.log ({
          message:       `[${label}]`,
          message_color: settings.label_color
        });
        this.log ({
          message:       settings.message,
          message_color: settings.message_color,
          label:         ' '
        });
        return;
      }
    }
    else {
      log_lines.push (...lines);
    }

    this.log_entries.push (
      ...log_lines.map (
        (msg) => new LogEntry ({ ...(settings as object), message: msg })
      )
    );
  }

  protected do_present (): OccupiedSpace {
    let completed_space = 0;
    let completed_tasks = 0;
    for (const task of this.tasks) {
      if (!task.present_completed)
        break;
      if (!task.was_presented)
        break;
      completed_space += task.previous_vertical_space + 1;
      completed_tasks++;
    }
    const total_space = this.tasks.filter ((t) => t.was_presented)
      .reduce (
        (acc, task) => acc + task.previous_vertical_space + 1,
        0
      );

    const available_space: number
      = typeof process.stdout.rows === 'number' && process.stdout.rows > 0
        ? process.stdout.rows - 1
        : total_space;

    let move_up = 0;
    const has_logs = this.log_entries.length > 0;

    if (!this.is_running)
      move_up = 0;
    else if (has_logs)
      move_up = total_space;
    else
      move_up = total_space - completed_space;

    move_up = Math.min (move_up, available_space);

    if (move_up > 0 && this.isTTY)
      process.stderr.write (`\u001b[${move_up}A`);

    if (has_logs)
      this.print_logs ();

    const used_space = new OccupiedSpace (0, 0);
    if (this.isTTY) {
      for (
        let i = has_logs ? 0 : completed_tasks;
        i < this.tasks.length;
        i++
      ) {
        used_space.add (this.tasks[i].present ());
        process.stderr.write ('\u001b[K\n');
        if (used_space.height >= available_space)
          break;
      }
    }
    else {
      for (const task of this.tasks)
        task.present_completed = task.completed;
    }

    if (this.clear_completed) {
      while (this.tasks.length > 0 && this.tasks[0].present_completed) {
        const task = this.tasks.shift ();
        assert (typeof task !== 'undefined', 'Task is undefined');
      }
    }
    return used_space;
  }

  public async update (): Promise<void> {
    await this.present ();

    if (
      (this.subtasks_present_completed || this.tasks.length === 0)
      && this.interval !== null
    ) {
      clearInterval (this.interval);
      this.interval = null;
      if (this.isTTY)
        process.stderr.write ('\x1b[?25h');
      this.is_running = false;
      this.present_completed = true;
    }
    else if (this.interval === null) {
      this.interval = setInterval (() => this.update (), 100);
      if (this.isTTY)
        process.stderr.write ('\x1b[?25l');
      this.is_running = true;
      this.present_completed = false;
    }
  }

  public async await_end (): Promise<void> {
    const sublog = log.extend ('await_end');
    while (this.interval !== null) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise ((resolve) => setTimeout (resolve, 100));
      sublog (
        `running: ${this.is_running}; subtasks_present_completed: ${
          this.subtasks_present_completed
        }; interval: ${Boolean (this.interval)}`
      );
    }
  }
}
