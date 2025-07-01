/* eslint-disable max-classes-per-file */

import { TaskHorizontal } from './TaskHorizontal';

export type TaskProcess = (
  task: TaskHorizontal,
  next: () => void,
  logger: (...messages: string[]) => void,
  abort_signal: AbortSignal
) => Promise<boolean | void> | boolean | void;

export interface TaskScheduleSettings {
  id: string;
  process: TaskProcess;
  dependencies?: string[];
  progress_by_time?: boolean;
  ready?: () => boolean;
  label?: string;
}

export class DependencyList extends Array<string> {
  push (...items: string[]): number {
    return super.push (...items.map ((v) => v.toLowerCase ()));
  }

  fill (value: string, start?: number, end?: number): this {
    return super.fill (value.toLowerCase (), start, end);
  }

  unshift (...items: string[]): number {
    return super.unshift (...items.map ((v) => v.toLowerCase ()));
  }
}

export class TaskSchedule {
  private _id: string;
  private _process: TaskProcess;
  private _label: string;
  private _abort_controller: AbortController;
  private _task: TaskHorizontal;
  private _dependencies: DependencyList = new DependencyList;
  public progress_by_time;
  public ready: () => boolean;

  public get id (): string {
    return this._id.toLowerCase ();
  }

  public get label (): string {
    return this._label || this._id;
  }

  public get dependencies (): string[] {
    return this._dependencies;
  }

  public set dependencies (value: string[]) {
    this._dependencies.splice (0);
    this._dependencies.push (...value);
  }

  public get abort_controller (): AbortController {
    return this._abort_controller;
  }

  public get task (): TaskHorizontal {
    return this._task;
  }

  constructor (settings: TaskScheduleSettings) {
    this._id = settings.id;
    this._process = settings.process;
    this.dependencies = settings.dependencies || [];
    this.progress_by_time = settings.progress_by_time || false;
    this.ready = settings.ready || (() => true);
    this._label = settings.label || '';

    this._abort_controller = (new AbortController);
    this.abort_controller.signal.addEventListener ('abort', () => {
      if (this.task.completed)
        return;
      this.task.state = 'skipped';
      this.task.completed = true;
    });

    this._task = (new TaskHorizontal);
    this._task.task_id = this._id;
    this._task.label.value = this._label;
    this._task.progress_by_time = this.progress_by_time;
  }

  public async run (
    next: () => void,
    logger: (...messages: string[]) => void
  ): Promise<void> {
    if (this.progress_by_time)
      this.task.start_timer ();
    try {
      this.task.state = 'running';
      await this.task.promise (
        Promise.resolve (
          this._process (this.task, next, logger, this.abort_controller.signal)
        )
      );
      if (this.progress_by_time)
        this.task.stop_timer (true);
    }
    finally {
      this.task.stop_timer (false);
    }
  }

  public check_dependencies (completed: string[]): boolean {
    return this.dependencies.every ((dep) => completed.includes (dep));
  }
}
