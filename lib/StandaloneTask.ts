import assert from 'assert';
import debug from 'debug';
import { Chalk } from 'chalk';
import { BaseTask } from './BaseTask';
import { OccupiedSpace } from './Space';
import { color_by_state, TaskState } from './State';
import { time_store } from './TimeStore';

const log = debug ('sapphirecode:tasks:StandaloneTask');

export abstract class StandaloneTask extends BaseTask {
  private _task_id = '';
  private _average_time = 0;
  private _start_time = 0;
  private _progress_by_time = false;
  private _time_by_progress = false;
  private _color: Chalk | null = null;

  /*  eslint-disable-next-line no-use-before-define */
  private _sync_task: StandaloneTask | null = null;

  public get color (): Chalk {
    if (this._sync_task !== null)
      return this._sync_task.color;
    return this._color || color_by_state (this.state);
  }

  public set color (value: Chalk | null) {
    this._color = value;
  }

  public get progress_by_time () {
    if (this._sync_task !== null)
      return this._sync_task.progress_by_time;
    return this._progress_by_time;
  }

  public set progress_by_time (value: boolean) {
    assert (
      !this._time_by_progress,
      'Cannot set both progress_by_time and time_by_progress'
    );
    this._progress_by_time = value;
    if (this.task_id.length > 0)
      this.total = Math.max (1, this.average_time);
  }

  public get time_by_progress () {
    if (this._sync_task !== null)
      return this._sync_task.time_by_progress;
    return this._time_by_progress;
  }

  public set time_by_progress (value: boolean) {
    assert (
      !this._progress_by_time,
      'Cannot set both progress_by_time and time_by_progress'
    );
    this._time_by_progress = value;
  }

  public set sync_task (value: StandaloneTask | null) {
    this._sync_task = value;
  }

  public get progress (): number {
    if (this._sync_task !== null)
      return this._sync_task.progress;
    return super.progress;
  }

  public set progress (value: number) {
    super.progress = value;
  }

  public get current () {
    if (this._sync_task !== null)
      return this._sync_task.current;
    return super.current;
  }

  public set current (value: number) {
    super.current = value;
  }

  public get total (): number {
    if (this._sync_task !== null)
      return this._sync_task.total;
    return super.total;
  }

  public set total (value: number) {
    super.total = value;
  }

  public get completed (): boolean {
    if (this._sync_task !== null)
      return this._sync_task.completed;
    return super.completed;
  }

  public set completed (value: boolean) {
    super.completed = value;
    if (this.progress_by_time)
      this.current = this.total;
  }

  public get state () {
    if (this._sync_task !== null)
      return this._sync_task.state;
    return super.state;
  }

  public set state (value: TaskState) {
    super.state = value;
  }

  public get elapsed_time (): number {
    if (this._sync_task !== null)
      return this._sync_task.elapsed_time;

    if (this._start_time === 0)
      return 0;

    return Date.now () - this._start_time;
  }

  public get remaining_time (): number {
    if (this._sync_task !== null)
      return this._sync_task.remaining_time;

    if (this._start_time === 0)
      return 0;
    if (this.average_time === 0)
      return 0;

    const time = this.elapsed_time;
    const remaining = Math.max (0, this.average_time - time);
    return remaining;
  }

  public get remaining_time_formatted (): string {
    const day = 24 * 60 * 60 * 1000;
    const remaining = this.remaining_time + 1000;

    let result = '';

    if (remaining >= day) {
      const days = Math.floor (remaining / day);
      result += `${days}d `;
    }

    result += new Date (remaining)
      .toISOString ()
      .substr (11, 8)
      .replace (/^[0:]+/u, '');
    if ((/^\d+$/u).test (result))
      return `${result}s`;

    if (result.length === 0)
      return '0s';

    return result;
  }

  public get task_id (): string {
    if (this._sync_task !== null)
      return this._sync_task.task_id;
    return this._task_id;
  }

  public set task_id (value: string) {
    this._task_id = value;
    if (value.length > 0) {
      this.average_time = time_store.get_avg_time (value);
      if (this.progress_by_time)
        this.total = Math.max (1, this.average_time);
    }
  }

  public get display_name (): string {
    return this.task_id + ': ' + this.completed;
  }

  public get average_time (): number {
    if (this._sync_task !== null)
      return this._sync_task.average_time;
    if (this.time_by_progress) {
      const progress = this.progress;
      if (progress === 0)
        return 0;
      return this.elapsed_time / progress;
    }
    return this._average_time;
  }

  public set average_time (value: number) {
    this._average_time = value;
  }

  public start_timer () {
    const sublog = log.extend ('start_timer');
    assert (this._task_id.length > 0, 'Task ID must be set');
    const timestamp = new Date;
    sublog (`Starting timer for ${this._task_id
    } at ${timestamp.toISOString ()}`);
    this._start_time = timestamp.getTime ();
  }

  public async stop_timer (save: boolean): Promise<void> {
    const sublog = log.extend ('stop_timer');
    assert (this._task_id.length > 0, 'Task ID must be set');
    const timestamp = new Date;
    sublog (`Stopping timer for ${this._task_id} at ${
      timestamp.toISOString ()}; save: ${save}`);
    const time = timestamp.getTime () - this._start_time;
    if (save)
      await time_store.set_time (this._task_id, time);

    this.average_time = time_store.get_avg_time (this._task_id);
    this._start_time = 0;
  }

  public promise (promise: Promise<unknown>) {
    return promise.then (() => {
      this.completed = true;
      this.state = 'successful';
    })
      .catch ((err) => {
        this.completed = true;
        this.state = 'failed';
        throw err;
      });
  }

  public present (): OccupiedSpace {
    if (this._sync_task === null
      && this.progress_by_time
      && this._start_time > 0
      && this.average_time > 0) {
      this.current = Math.min (
        Math.max (this.elapsed_time, 0),
        this.average_time
      );
      this.total = this.average_time;
    }

    return super.present ();
  }
}
