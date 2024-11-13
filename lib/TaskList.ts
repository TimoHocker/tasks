import { BaseTask, ITask } from './BaseTask';
import { TaskState } from './State';

export abstract class TaskList extends BaseTask {
  private _tasks: ITask[] = [];

  public get tasks () {
    return this._tasks;
  }

  public get display_name () {
    return `list[${this.tasks.map ((v) => v.display_name)
      .join (' ')}]`;
  }

  public get progress () {
    if (this.tasks.length === 0)
      return 0;

    const res = this.tasks.reduce ((acc, task) => (
      {
        current: acc.current + task.current,
        total:   acc.total + task.total
      }), { current: 0, total: 0 });
    return res.current / res.total;
  }

  public get state (): TaskState {
    let skipped = true;
    let paused = true;
    let successful = true;
    for (const task of this.tasks) {
      if (task.state !== 'skipped')
        skipped = false;
      if (task.state !== 'paused')
        paused = false;
      if (task.state !== 'successful')
        successful = false;
    }
    if (!this.completed) {
      if (paused)
        return 'paused';
      return 'running';
    }
    if (skipped)
      return 'skipped';
    if (successful)
      return 'successful';
    return 'failed';
  }

  public get completed () {
    return (
      this.tasks.length > 0
      && this.tasks.filter ((v) => !v.completed).length === 0
    );
  }

  public get subtasks_present_completed () {
    return (
      this.tasks.length > 0
      && this.tasks.filter ((v) => !v.present_completed).length === 0
    );
  }

  public get incomplete_tasks () {
    return this.tasks.filter ((v) => !v.present_completed);
  }
}
