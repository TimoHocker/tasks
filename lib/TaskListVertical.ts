import { ITask } from "./Task";
import process from 'process';

export class TaskListVertical {
  public tasks: ITask[] = [];
  private interval: NodeJS.Timeout | null = null;

  public update() {
    this.tasks.sort((a, b) => a.progress - b.progress);
    process.stderr.write('\u001b[' + this.tasks.length + 'A');
    for (let i = this.tasks.length - 1; i >= 0; i--) {
      const task = this.tasks[i];
      if (task.completed)
        this.tasks.splice(i, 1);
      
      task.present();
      process.stderr.write('\u001b[K\n');
    }
    if (this.tasks.length === 0 && this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    } else if (this.interval === null) {
      this.interval = setInterval(() => this.update(), 100);
    }
  }
}
