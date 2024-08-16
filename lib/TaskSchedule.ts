import { TaskHorizontal } from './TaskHorizontal';

export type TaskProcess = (task: TaskHorizontal,
  next: () => void,
  logger: (...messages: string[]) => void
) => Promise<boolean | void> | boolean | void;

export interface TaskScheduleSettings {
  id: string;
  process: TaskProcess;
  dependencies?: string[];
  progress_by_time?: boolean;
  ready?: () => boolean;
  label?: string;
}

export class TaskSchedule {
  private _id: string;
  private _process: TaskProcess;
  public dependencies: string[];
  public progress_by_time;
  public ready: () => boolean;
  public _label: string;

  public get id (): string {
    return this._id;
  }

  public get label (): string {
    return this._label || this._id;
  }

  constructor (settings: TaskScheduleSettings) {
    this._id = settings.id;
    this._process = settings.process;
    this.dependencies = settings.dependencies || [];
    this.progress_by_time = settings.progress_by_time || false;
    this.ready = settings.ready || (() => true);
    this._label = settings.label || '';
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
