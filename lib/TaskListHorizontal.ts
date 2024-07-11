import chalk from 'chalk';
import { ITask } from './Task';
import { Spinner } from './Spinner';
import { LabelledTask } from './LabelledTask';

export class TaskListHorizontal extends LabelledTask implements ITask {
  public tasks: ITask[] = [];
  public display_percentage = true;
  public display_spinner = true;

  private spinner = new Spinner;

  public present_completed = false;

  public get completed () {
    return this.tasks.length > 0
      && this.tasks.filter ((v) => !v.completed).length === 0;
  }

  public get progress () {
    if (this.tasks.length === 0)
      return 0;

    return (
      this.tasks.reduce ((acc, task) => acc + task.progress, 0)
      / this.tasks.length
    );
  }

  public present () {
    if (this.completed) {
      process.stderr.write (chalk.green ('✓ '));
      this.present_label (true);
      this.present_completed = true;
      return;
    }

    this.present_completed = false;
    if (this.display_spinner)
      this.spinner.present ();


    this.present_label ();
    for (const task of this.tasks)
      task.present ();
    if (this.display_percentage)
      process.stderr.write (` ${Math.round (this.progress * 100)}%`);
  }
}
