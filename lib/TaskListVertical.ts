import { ITask } from './Task';

export class TaskListVertical {
  public tasks: ITask[] = [];
  private interval: NodeJS.Timeout | null = null;
  private space_used = 0;

  public update () {
    let completed = 0;
    for (const task of this.tasks) {
      if (!task.present_completed)
        break;
      completed++;
    }

    const move_up = Math.min (this.space_used, this.tasks.length - completed);
    if (move_up > 0)
      process.stderr.write (`\u001b[${move_up}A`);

    this.space_used = completed;
    for (let i = completed; i < this.tasks.length; i++) {
      this.tasks[i].present ();
      process.stderr.write ('\u001b[K\n');
      this.space_used++;
    }

    if (this.tasks.length === completed && this.interval !== null) {
      clearInterval (this.interval);
      this.interval = null;
      process.stderr.write ('\x1b[?25l');
    }
    else if (this.interval === null) {
      this.interval = setInterval (() => this.update (), 100);
      process.stderr.write ('\x1b[?25h');
    }
  }

  public async await_end (): Promise<void> {
    while (this.interval !== null)
      // eslint-disable-next-line no-await-in-loop
      await new Promise ((resolve) => setTimeout (resolve, 100));
  }
}
