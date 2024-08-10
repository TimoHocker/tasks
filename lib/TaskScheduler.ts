import { TaskSchedule } from './TaskSchedule';

export class TaskScheduler {
  public schedules: TaskSchedule[] = [];
  public queue: TaskSchedule[] = [];
  public completed: string[] = [];
  public running: string[] = [];
  public failed: string[] = [];

  public on_failure: (task_id: string, error: unknown) => void
    = (task_id, error) => {
      throw new Error (`Task ${task_id} failed: ${error}`);
    };

  private validate_dependencies (): void {
    const available_dependencies = this.schedules.map ((v) => v.id);
    for (const schedule of this.schedules) {
      for (const dep of schedule._dependencies) {
        if (!available_dependencies.includes (dep)) {
          throw new Error (`Dependency ${dep
          } not found for task ${schedule.id}`);
        }
      }
    }
  }

  public run (): Promise<void> {
    this.validate_dependencies ();

    this.queue = [ ...this.schedules ];
    this.running = [];
    this.completed = [];
    this.failed = [];

    while (this.queue.length > 0) {
      let startable: TaskSchedule | null = null;
      for (let i = this.queue.length - 1; i >= 0; i--) {
        const schedule = this.queue[i];
        if (schedule.check_dependencies (this.completed)) {
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
        if (this.running.length === 0)
          throw new Error ('Circular dependency detected');

        // eslint-disable-next-line no-await-in-loop
        await new Promise ((resolve) => setTimeout (resolve, 100));
        continue;
      }

      this.running.push (startable.id);
      startable._process (startable, () => {
        completed.push (startable.id);
      })
        .catch ((error) => {
          this.failed.push (startable.id);
          this.on_failure (startable.id, error);
        })
        .then (() => {
          this.running.splice (this.running.indexOf (startable.id), 1);
          if (!this.completed.includes (startable.id))
            this.completed.push (startable.id);
        });
    }
  }
}
