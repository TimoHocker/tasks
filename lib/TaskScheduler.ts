import { Task } from './Task';
import { TaskHorizontal } from './TaskHorizontal';
import { TaskListHorizontal } from './TaskListHorizontal';
import { TaskListVertical } from './TaskListVertical';
import { TaskSchedule, TaskScheduleSettings } from './TaskSchedule';

export class TaskScheduler {
  private _queue: TaskSchedule[] = [];
  private _completed: string[] = [];
  private _running: string[] = [];
  private _failed: string[] = [];
  private _promises: Promise<void>[] = [];

  public schedules: TaskSchedule[] = [];
  public label: string;

  public get queue (): string[] {
    return this._queue.map ((v) => v.id);
  }

  public get completed (): string[] {
    return [ ...this._completed ];
  }

  public get running (): string[] {
    return [ ...this._running ];
  }

  public get failed (): string[] {
    return [ ...this._failed ];
  }

  public constructor (label = '') {
    this.label = label;
  }

  public add (settings: TaskScheduleSettings) {
    this.schedules.push (new TaskSchedule (settings));
  }

  public on_failure: (task_id: string, error: unknown) => void = (
    task_id,
    error
  ) => {
    throw new Error (`Task ${task_id} failed: ${error}`);
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

  // eslint-disable-next-line max-lines-per-function, max-statements
  public async run (): Promise<void> {
    this.validate_dependencies ();

    this._queue = [ ...this.schedules ];
    this._running = [];
    this._completed = [];
    this._failed = [];
    this._promises = [];

    const task_list = (new TaskListVertical);
    task_list.clear_completed = true;

    const summary = (new TaskListHorizontal);
    task_list.tasks.push (summary);
    summary.label.value = this.label;
    summary.label.length = this.label.length;

    const summary_tasks: Record<string, Task> = {};

    for (const schedule of this.schedules) {
      const task = (new Task);
      summary.tasks.push (task);
      summary_tasks[schedule.id] = task;
      task.state = 'paused';
    }

    task_list.update ();

    while (this._queue.length > 0) {
      let startable: TaskSchedule | null = null;
      let waiting = false;
      for (let i = this._queue.length - 1; i >= 0; i--) {
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
            this.on_failure (
              schedule.id,
              `Dependencies failed: ${failed.join (', ')}`
            );
          }
        }
      }
      if (startable === null) {
        if (this._running.length === 0 && !waiting)
          throw new Error ('Circular dependency detected');

        // eslint-disable-next-line no-await-in-loop
        await new Promise ((resolve) => setTimeout (resolve, 100));
        continue;
      }

      this._running.push (startable.id);
      const task = (new TaskHorizontal);
      task.task_id = startable.id;
      task.progress_by_time = startable.progress_by_time;
      task_list.tasks.splice (task_list.tasks.length - 1, 0, task);
      summary_tasks[startable.id].state = 'running';
      summary_tasks[startable.id].sync_task = task;

      if (startable.progress_by_time)
        task.start_timer ();
      this._promises.push (
        (async () => {
          try {
            await task.promise (
              startable.run (
                task,
                () => {
                  this._completed.push (startable.id);
                },
                task_list.log.bind (task_list)
              )
            );
          }
          catch (error) {
            if (startable.progress_by_time)
              await task.stop_timer (false);
            this._failed.push (startable.id);
            this.on_failure (startable.id, error);
          }

          if (startable.progress_by_time)
            await task.stop_timer (true);
          this._running.splice (this._running.indexOf (startable.id), 1);
          if (!this._completed.includes (startable.id))
            this._completed.push (startable.id);
        }) ()
      );
    }

    await Promise.all (this._promises);
    this._promises = [];
    await task_list.await_end ();
  }
}
