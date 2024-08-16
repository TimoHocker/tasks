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
}

export class TaskSchedule {
  private _id: string;
  private _process: TaskProcess;
  public dependencies: string[];
  public progress_by_time;
  public ready: () => boolean;

  public get id (): string {
    return this._id;
  }

  constructor (settings: TaskScheduleSettings) {
    this._id = settings.id;
    this._process = settings.process;
    this.dependencies = settings.dependencies || [];
    this.progress_by_time = settings.progress_by_time || false;
    this.ready = settings.ready || (() => true);
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
