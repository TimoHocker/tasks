import { ITask, TaskState } from './Task';
import { Spinner } from './Spinner';
import { LabelledTask } from './LabelledTask';

export class TaskListHorizontal extends LabelledTask implements ITask {
  public tasks: ITask[] = [];
  public display_percentage = true;
  public display_spinner = true;

  private spinner = (new Spinner);

  public present_completed = false;

  public get completed () {
    return (
      this.tasks.length > 0
      && this.tasks.filter ((v) => !v.completed).length === 0
    );
  }

  public get state (): TaskState {
    let skipped = true;
    for (const task of this.tasks) {
      if (task.state !== 'skipped')
        skipped = false;
      if (task.state === 'failed')
        return 'failed';
    }
    if (this.completed) {
      if (skipped)
        return 'skipped';
      return 'successful';
    }
    return 'running';
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
      this.spinner.present (this.state);
      this.present_label (true);
      this.present_completed = true;
      return;
    }

    this.present_completed = false;
    if (this.display_spinner)
      this.spinner.present (this.state);

    this.present_label ();
    for (const task of this.tasks)
      task.present ();
    if (this.display_percentage)
      process.stderr.write (` ${Math.round (this.progress * 100)}%`);
  }
}
