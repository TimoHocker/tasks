import { ITask } from './Task';

export class TaskListVertical {
  public tasks: ITask[] = [];
  private interval: NodeJS.Timeout | null = null;

  public update () {
    let completed = 0;
    for (const task of this.tasks) {
      if (!task.present_completed)
        break;
      completed++;
    }

    process.stderr.write (`\u001b[${this.tasks.length - completed}A`);
    for (let i = completed; i < this.tasks.length; i++) {
      this.tasks[i].present ();
      process.stderr.write ('\u001b[K\n');
    }

    if (this.tasks.length === completed && this.interval !== null) {
      clearInterval (this.interval);
      this.interval = null;
    }
    else if (this.interval === null) {
      this.interval = setInterval (() => this.update (), 100);
    }
  }
}
