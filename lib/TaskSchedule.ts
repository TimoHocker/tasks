import { ITask } from './BaseTask';

export type TaskProcess = (task: ITask,
  next: () => void) => Promise<boolean | void> | boolean | void;

export class TaskSchedule {
  private _id: string;
  private _process: TaskProcess;
  private _dependencies: string[] = [];

  public get id (): string {
    return this._id;
  }

  constructor (id: string, process: TaskProcess) {
    this._id = id;
    this._process = process;
  }

  public add_dependency (id: string): void {
    this._dependencies.push (id);
  }

  public check_dependencies (completed: string[]): boolean {
    return this._dependencies.every ((dep) => completed.includes (dep));
  }
}
