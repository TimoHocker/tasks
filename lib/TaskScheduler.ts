/* eslint-disable-next-line max-len */
/* eslint-disable max-classes-per-file, @typescript-eslint/no-non-null-assertion */
import chalk, { Chalk } from 'chalk';
import { LogEntry, LogEntrySettings } from './Logging';
import { Task } from './Task';
import { TaskListHorizontal } from './TaskListHorizontal';
import { TaskListVertical } from './TaskListVertical';
import { TaskSchedule, TaskScheduleSettings } from './TaskSchedule';

export abstract class ScheduleError extends Error {
  public abstract type: 'dependency' | 'error';
}

export class ScheduleDependencyError extends ScheduleError {
  public dependencies: string[];

  public get type (): 'dependency' | 'error' {
    return 'dependency';
  }

  public constructor (dependencies: string[]) {
    super (`Dependency not met: ${dependencies.join (', ')}`);
    this.dependencies = dependencies;
  }
}

export class ScheduleExceptionError extends ScheduleError {
  public get type (): 'dependency' | 'error' {
    return 'error';
  }
}

export class TaskScheduler {
  private _queue: TaskSchedule[] = [];
  private _running: TaskSchedule[] = [];
  private _completed: string[] = [];
  private _failed: string[] = [];
  private _promises: Promise<void>[] = [];
  private _task_list: TaskListVertical | null = null;
  private _show_summary: boolean;

  public schedules: TaskSchedule[] = [];
  public label: string;
  public max_parallel = 16;
  public colors: Chalk[] = [
    chalk.red,
    chalk.green,
    chalk.yellow,
    chalk.blue,
    chalk.magenta,
    chalk.cyan,
    chalk.white
  ];

  public get queue (): string[] {
    return this._queue.map ((v) => v.id);
  }

  public get completed (): string[] {
    return [ ...this._completed ];
  }

  public get running (): string[] {
    return this._running.map ((v) => v.id);
  }

  public get failed (): string[] {
    return [ ...this._failed ];
  }

  public constructor (label = '', show_summary = true) {
    this.label = label;
    this._show_summary = show_summary;
  }

  public add (settings: TaskScheduleSettings) {
    this.schedules.push (new TaskSchedule (settings));
  }

  public add_schedule (schedule: TaskSchedule) {
    this.schedules.push (schedule);
  }

  public log (message: LogEntrySettings | string) {
    if (this._task_list) {
      this._task_list.log (message);
      return;
    }
    const entry = new LogEntry (typeof message === 'string'
      ? { message }
      : message);
    entry.print ();
  }

  public on_failure: (task_id: string, error: ScheduleError) => void = (
    task_id,
    error
  ) => {
    throw error;
  };

  private validate_dependencies (): void {
    const available_dependencies = this.schedules.map ((v) => v.id);
    for (const schedule of this.schedules) {
      for (const dep of schedule.dependencies) {
        if (!available_dependencies.includes (dep)) {
          throw new Error (
            `Dependency ${dep} not found for task ${schedule.id}`
          );
        }
      }
    }
  }

  // eslint-disable-next-line max-lines-per-function, max-statements, complexity
  public async run (): Promise<void> {
    this.validate_dependencies ();

    this._queue = [ ...this.schedules ];
    this._running = [];
    this._completed = [];
    this._failed = [];
    this._promises = [];

    this._task_list = (new TaskListVertical);
    this._task_list.clear_completed = true;

    if (!this._task_list.isTTY)
      this._show_summary = false;

    let color_index = 0;
    const get_color = () => {
      const color = this.colors[color_index];
      color_index = (color_index + 1) % this.colors.length;
      return color;
    };

    if (this._show_summary) {
      const summary = (new TaskListHorizontal);
      this._task_list.tasks.push (summary);
      summary.label.value = this.label;
      summary.label.length = this.label.length;

      const summary_tasks: Record<string, Task> = {};

      for (const schedule of this.schedules) {
        const task = (new Task);
        summary.tasks.push (task);
        summary_tasks[schedule.id] = task;
        task.sync_task = schedule.task;
        schedule.task.state = 'paused';
      }
    }

    this._task_list.update ();

    const abort_controller = new AbortController;
    abort_controller.signal.addEventListener ('abort', () => {
      for (const schedule of this._running)
        schedule.abort_controller.abort ();
      for (const schedule of this._queue)
        schedule.abort_controller.abort ();
    });

    while (this._queue.length > 0 && !abort_controller.signal.aborted) {
      let startable: TaskSchedule | null = null;
      let waiting = false;
      for (let i = this._queue.length - 1; i >= 0; i--) {
        if (this._running.length >= this.max_parallel) {
          waiting = true;
          break;
        }

        const schedule = this._queue[i];
        if (schedule.check_dependencies (this._completed)) {
          if (!schedule.ready ()) {
            waiting = true;
            continue;
          }
          startable = schedule;
          this._queue.splice (i, 1);
          break;
        }
        else {
          const failed = schedule.dependencies.filter (
            (v) => this._failed.includes (v)
          );
          if (failed.length > 0) {
            this._failed.push (schedule.id);
            this._queue.splice (i, 1);
            schedule.task.state = 'skipped';
            this.on_failure (
              schedule.id,
              new ScheduleDependencyError (failed)
            );
          }
        }
      }
      if (startable === null) {
        if (!waiting && this._running.length === 0 && this._queue.length > 0)
          throw new Error ('Circular dependency detected');

        // eslint-disable-next-line no-await-in-loop
        await new Promise ((resolve) => setTimeout (resolve, 100));
        continue;
      }

      this._running.push (startable);
      if (this._show_summary) {
        this._task_list.tasks.splice (
          this._task_list.tasks.length - 1,
          0,
          startable.task
        );
      }
      else {
        this._task_list.tasks.push (startable.task);
      }

      this._promises.push (
        (async () => {
          const color = get_color ();
          try {
            await startable.run (
              () => {
                this._completed.push (startable.id);
              },
              (...messages: string[]) => this._task_list!.log ({
                message:     messages.join (' '),
                label:       startable.label,
                label_color: color
              })
            );
          }
          catch (error) {
            this._failed.push (startable.id);
            this.on_failure (startable.id, new ScheduleExceptionError (
              `Task ${startable.id} failed`,
              { cause: error }
            ));
          }

          this._running.splice (this._running.indexOf (startable), 1);
          if (!this._completed.includes (startable.id))
            this._completed.push (startable.id);
        }) ()
          .catch ((error) => {
            abort_controller.abort (error);
          })
      );
    }

    await Promise.all (this._promises);
    this._promises = [];
    await this._task_list.await_end ();
    if (abort_controller.signal.aborted)
      throw abort_controller.signal.reason;
    this._task_list = null;
  }
}
