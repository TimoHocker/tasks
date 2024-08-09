import { BaseTask, ITask } from './BaseTask';
import { TaskState } from './State';

export abstract class TaskList extends BaseTask {
  private _tasks: ITask[] = [];

  public get tasks () {
    return this._tasks;
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
}
