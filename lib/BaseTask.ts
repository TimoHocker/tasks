import assert from 'assert';
import { time_store } from './TimeStore';
import { TaskState } from './State';

export interface ITask {
  completed: boolean;
  state: TaskState;
  present_completed: boolean;
  progress: number;
  current: number;
  total: number;
  present(): void;
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
  /* eslint-disable-next-line no-use-before-define */
  private _sync_task: BaseTask | null = null;

  public present_completed = false;

  public get progress_by_time () {
    return this._progress_by_time;
  }

  public set progress_by_time (value: boolean) {
    this._progress_by_time = value;
  }

  public set sync_task (value: BaseTask | null) {
    this._sync_task = value;
  }

  public get state () {
    return this._state;
  }

  public set state (value: TaskState) {
    this._state = value;
  }

  public get elapsed_time () {
    if (this._start_time === 0)
      return 0;

    return Date.now () - this._start_time;
  }

  public get remaining_time () {
    if (this._start_time === 0)
      return 0;
    if (this._average_time === 0)
      return 0;

    const time = this.elapsed_time;
    const remaining = Math.max (0, this._average_time - time);
    return remaining;
  }

  public get remaining_time_formatted () {
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

  public get task_id () {
    return this._task_id;
  }

  public set task_id (value: string) {
    this._task_id = value;
    if (value.length > 0)
      this._average_time = time_store.get_avg_time (value);
  }

  public get average_time () {
    return this._average_time;
  }

  public get completed () {
    return this._completed;
  }

  public set completed (value: boolean) {
    this._completed = value;
    if (this.progress_by_time)
      this.current = this.total;
  }

  public get progress () {
    return this._current / this._total;
  }

  public set progress (value: number) {
    this._total = 1;
    this._current = value;
  }

  public get total () {
    return this._total;
  }

  public set total (value: number) {
    assert (value > 0, 'Total must be greater than 0');
    this._total = value;
  }

  public get current () {
    return this._current;
  }

  public set current (value: number) {
    this._current = value;
  }

  public start_timer () {
    assert (this._task_id.length > 0, 'Task ID must be set');
    this._start_time = Date.now ();
  }

  public async stop_timer (save: boolean): Promise<void> {
    assert (this._task_id.length > 0, 'Task ID must be set');
    const time = Date.now () - this._start_time;
    if (save)
      await time_store.set_time (this._task_id, time);

    this._average_time = time_store.get_avg_time (this._task_id);
    this._start_time = 0;
  }

  public promise (promise: Promise<unknown>) {
    promise.then (() => {
      this.completed = true;
      this.state = 'successful';
    })
      .catch (() => {
        this.completed = true;
        this.state = 'failed';
      });
  }

  public present () {
    if (this._sync_task !== null) {
      this.progress_by_time = false;
      this._start_time = 0;
      this.task_id = this._sync_task.task_id;
      this.state = this._sync_task.state;
      this.completed = this._sync_task.completed;
      this.current = this._sync_task.current;
      this.total = this._sync_task.total;
    }

    if (this.progress_by_time
      && this._start_time > 0
      && this.average_time > 0) {
      this.current = Math.min (
        Math.max (this.elapsed_time, 0),
        this.average_time
      );
      this.total = this.average_time;
    }

    this.do_present ();
  }

  protected abstract do_present(): void;
}
