import assert from 'assert';
import debug from 'debug';
import { time_store } from './TimeStore';
import { TaskState } from './State';
import { OccupiedSpace } from './Space';

const log = debug ('sapphirecode:tasks:BaseTask');

export interface ITask {
  completed: boolean;
  state: TaskState;
  present_completed: boolean;
  progress: number;
  current: number;
  total: number;
  previous_vertical_space: number;
  was_presented: boolean;
  present(): OccupiedSpace;
}

export abstract class BaseTask {
  private _total = 1;
  private _current = 0;
  private _completed = false;
  private _state: TaskState = 'running';
  private _task_id = '';
  private _average_time = 0;
  private _start_time = 0;
  private _progress_by_time = false;
  private _previous_vertical_space = 0;
  private _was_presented = false;
  /* eslint-disable-next-line no-use-before-define */
  private _sync_task: BaseTask | null = null;

  public present_completed = false;

  public get previous_vertical_space () {
    return this._previous_vertical_space;
  }

  public get was_presented () {
    return this._was_presented;
  }

  public get progress_by_time () {
    if (this._sync_task !== null)
      return this._sync_task.progress_by_time;
    return this._progress_by_time;
  }

  public set progress_by_time (value: boolean) {
    this._progress_by_time = value;
    if (this.task_id.length > 0)
      this.total = Math.max (1, this.average_time);
  }

  public set sync_task (value: BaseTask | null) {
    this._sync_task = value;
  }

  public get state () {
    if (this._sync_task !== null)
      return this._sync_task.state;
    return this._state;
  }

  public set state (value: TaskState) {
    this._state = value;
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
    if (this._average_time === 0)
      return 0;

    const time = this.elapsed_time;
    const remaining = Math.max (0, this._average_time - time);
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
      this._average_time = time_store.get_avg_time (value);
      if (this.progress_by_time)
        this.total = Math.max (1, this.average_time);
    }
  }

  public get average_time (): number {
    if (this._sync_task !== null)
      return this._sync_task.average_time;
    return this._average_time;
  }

  public get completed (): boolean {
    if (this._sync_task !== null)
      return this._sync_task.completed;
    return this._completed;
  }

  public set completed (value: boolean) {
    this._completed = value;
    if (this.progress_by_time)
      this.current = this.total;
  }

  public get progress (): number {
    if (this._sync_task !== null)
      return this._sync_task.progress;
    return this._current / this._total;
  }

  public set progress (value: number) {
    this._total = 1;
    this._current = value;
  }

  public get total (): number {
    if (this._sync_task !== null)
      return this._sync_task.total;
    return this._total;
  }

  public set total (value: number) {
    assert (value > 0, 'Total must be greater than 0');
    this._total = value;
  }

  public get current () {
    if (this._sync_task !== null)
      return this._sync_task.current;
    return this._current;
  }

  public set current (value: number) {
    this._current = value;
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

    this._average_time = time_store.get_avg_time (this._task_id);
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

    const space = this.do_present ();

    this._was_presented = true;

    this._previous_vertical_space = space.height;
    return space;
  }

  protected abstract do_present(): OccupiedSpace;
}
