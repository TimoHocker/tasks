import { Chalk } from 'chalk';
import { color_by_state } from './State';
import { OccupiedSpace } from './Space';
import { BaseTask } from './BaseTask';

export class Task extends BaseTask {
  public color: Chalk | null = null;
  public form = [
    '⠀',
    '⡀',
    '⣀',
    '⣄',
    '⣤',
    '⣦',
    '⣶',
    '⣷',
    '⣿'
  ];

  protected do_present (): OccupiedSpace {
    if (this.completed)
      this.present_completed = true;
    const index = Math.min (
      this.form.length - 1,
      Math.floor (this.progress * this.form.length)
    );
    const color = this.color || color_by_state (this.state);
    process.stderr.write (color (this.form[index]));
    return new OccupiedSpace (1, 0);
  }
}
