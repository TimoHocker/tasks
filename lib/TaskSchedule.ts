import { ITask } from './BaseTask';
import { TaskHorizontal } from './TaskHorizontal';
import { TaskLabel } from './TaskLabel';

export type TaskProcess = (task: TaskHorizontal,
  next: () => void,
  logger: (...messages: string[]) => void
) => Promise<boolean | void> | boolean | void;

export class TaskSchedule {
  private _id: string;
  private _process: TaskProcess;
  public dependencies: string[] = [];
  public progress_by_time = false;
  public ready: () => boolean = () => true;

  public get id (): string {
    return this._id;
  }

  constructor (id: string, process: TaskProcess) {
    this._id = id;
    this._process = process;
  }

  public run (
    task: TaskHorizontal,
    next: () => void,
    logger: (...messages: string[]) => void
  ): Promise<boolean | void> {
    return Promise.resolve (this._process (task, next, logger));
  }

  public check_dependencies (completed: string[]): boolean {
    return this.dependencies.every ((dep) => completed.includes (dep));
  }
}
