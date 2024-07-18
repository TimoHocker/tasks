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
    let paused = true;
    for (const task of this.tasks) {
      if (task.state !== 'skipped')
        skipped = false;
      if (task.state !== 'paused')
        paused = false;
      if (task.state === 'failed')
        return 'failed';
    }
    if (this.completed) {
      if (skipped)
        return 'skipped';
      return 'successful';
    }
    if (paused)
      return 'paused';
    return 'running';
  }

  public get progress () {
    if (this.tasks.length === 0)
      return 0;

    const res = this.tasks.reduce ((acc, task) => (
      {
        progress: acc.progress + Math.max (1, task.weight) * task.progress,
        total:    acc.total + Math.max (1, task.weight)
      }), { progress: 0, total: 0 });
    return res.progress / res.total;
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
