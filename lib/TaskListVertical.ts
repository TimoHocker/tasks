import { ITask } from './Task';

export class TaskListVertical {
  public tasks: ITask[] = [];
  private interval: NodeJS.Timeout | null = null;

  public update () {
    process.stderr.write (`\u001b[${this.tasks.length}A`);
    for (const task of this.tasks) {
      task.present ();
      process.stderr.write ('\u001b[K\n');
    }

    while (this.tasks.length > 0 && this.tasks[0].present_completed)
      this.tasks.shift ();

    if (this.tasks.length === 0 && this.interval !== null) {
      clearInterval (this.interval);
      this.interval = null;
    }
    else if (this.interval === null) {
      this.interval = setInterval (() => this.update (), 100);
    }
  }
}
