import { Task } from './Task';
import { TaskHorizontal } from './TaskHorizontal';
import { TaskListHorizontal } from './TaskListHorizontal';
import { TaskListVertical } from './TaskListVertical';
import { TaskSchedule } from './TaskSchedule';

export class TaskScheduler {
  public schedules: TaskSchedule[] = [];
  public queue: TaskSchedule[] = [];
  public completed: string[] = [];
  public running: string[] = [];
  public failed: string[] = [];
  public label = '';

  public on_failure: (task_id: string, error: unknown) => void
    = (task_id, error) => {
      throw new Error (`Task ${task_id} failed: ${error}`);
    };

  private validate_dependencies (): void {
    const available_dependencies = this.schedules.map ((v) => v.id);
    for (const schedule of this.schedules) {
      for (const dep of schedule.dependencies) {
        if (!available_dependencies.includes (dep)) {
          throw new Error (`Dependency ${dep
          } not found for task ${schedule.id}`);
        }
      }
    }
  }

  // eslint-disable-next-line max-lines-per-function, max-statements
  public async run (): Promise<void> {
    this.validate_dependencies ();

    this.queue = [ ...this.schedules ];
    this.running = [];
    this.completed = [];
    this.failed = [];

    const task_list = new TaskListVertical;
    task_list.clear_completed = true;

    const summary = new TaskListHorizontal;
    task_list.tasks.push (summary);
    summary.label.value = this.label;
    summary.label.length = this.label.length;

    const summary_tasks: Record<string, Task> = {};

    for (const schedule of this.schedules) {
      const task = new Task;
      summary.tasks.push (task);
      summary_tasks[schedule.id] = task;
      task.state = 'paused';
    }

    task_list.update ();

    while (this.queue.length > 0) {
      let startable: TaskSchedule | null = null;
      let waiting = false;
      for (let i = this.queue.length - 1; i >= 0; i--) {
        const schedule = this.queue[i];
        if (schedule.check_dependencies (this.completed)) {
          if (!schedule.ready ()) {
            waiting = true;
            continue;
          }
          startable = schedule;
          this.queue.splice (i, 1);
          break;
        }
        else if (schedule.check_dependencies ([
          ...this.completed,
          ...this.failed
        ])) {
          this.failed.push (schedule.id);
          this.queue.splice (i, 1);
        }
      }
      if (startable === null) {
        if (this.running.length === 0 && !waiting)
          throw new Error ('Circular dependency detected');

        // eslint-disable-next-line no-await-in-loop
        await new Promise ((resolve) => setTimeout (resolve, 100));
        continue;
      }

      this.running.push (startable.id);
      const task = new TaskHorizontal;
      task.task_id = startable.id;
      task.progress_by_time = startable.progress_by_time;
      task_list.tasks.splice (task_list.tasks.length - 1, 0, task);
      summary_tasks[startable.id].state = 'running';
      summary_tasks[startable.id].sync_task = task;

      if (startable.progress_by_time)
        task.start_timer ();
      task.promise (startable.run (task, () => {
        this.completed.push (startable.id);
      }, task_list.log.bind (task_list))
        .catch ((error: unknown) => {
          if (startable.progress_by_time)
            task.stop_timer (false);
          this.failed.push (startable.id);
          this.on_failure (startable.id, error);
        })
        .then (() => {
          if (startable.progress_by_time)
            task.stop_timer (true);
          this.running.splice (this.running.indexOf (startable.id), 1);
          if (!this.completed.includes (startable.id))
            this.completed.push (startable.id);
        }));
    }

    await task_list.await_end ();
  }
}
