import assert from 'assert';
import { TaskState } from './State';
import { OccupiedSpace } from './Space';

export interface ITask {
  completed: boolean;
  state: TaskState;
  present_completed: boolean;
  progress: number;
  current: number;
  total: number;
  previous_vertical_space: number;
  was_presented: boolean;
  display_name: string;
  present(): OccupiedSpace;
}

export abstract class BaseTask {
  private _total = 1;
  private _current = 0;
  private _completed = false;
  private _state: TaskState = 'running';
  private _previous_vertical_space = 0;
  private _was_presented = false;

  public present_completed = false;

  public get previous_vertical_space () {
    return this._previous_vertical_space;
  }

  public get was_presented () {
    return this._was_presented;
  }

  public get state () {
    return this._state;
  }

  public set state (value: TaskState) {
    this._state = value;
  }

  public get completed (): boolean {
    return this._completed;
  }

  public set completed (value: boolean) {
    this._completed = value;
  }

  public get progress (): number {
    return this._current / this._total;
  }

  public set progress (value: number) {
    this._total = 1;
    this._current = value;
  }

  public get total (): number {
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

  public present (): OccupiedSpace {
    const space = this.do_present ();

    this._was_presented = true;

    this._previous_vertical_space = space.height;
    return space;
  }

  protected abstract do_present(): OccupiedSpace;
}
