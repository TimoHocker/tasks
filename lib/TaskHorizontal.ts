/* eslint-disable max-statements */
import chalk from 'chalk';
import { TaskLabel } from './TaskLabel';
import { Spinner } from './Spinner';
import { BaseTask } from './BaseTask';
import { OccupiedSpace } from './Space';

export class TaskHorizontal extends BaseTask {
  public length = 10;
  public display_percentage = true;
  public display_spinner = true;
  public display_progress_bar = true;
  public display_remaining = true;
  private _label = (new TaskLabel);

  public get label () {
    return this._label;
  }

  private spinner = (new Spinner);

  public color = chalk.white;
  public form = [
    '⡇',
    '⣿'
  ];

  protected do_present (): OccupiedSpace {
    const space = new OccupiedSpace (0, 0);
    if (this.completed) {
      if (this.state === 'running')
        this.state = 'successful';
      this.spinner.present (this.state);
      this.label.present (true);
      this.present_completed = true;
      return space;
    }

    if (this.progress_by_time) {
      this.display_remaining = this.average_time > 0;
      this.display_progress_bar = this.average_time > 0;
      this.display_percentage = this.average_time > 0;
    }

    const progress = this.length * this.progress;

    if (this.display_spinner)
      space.add (this.spinner.present (this.state));

    space.add (this.label.present ());

    if (this.display_progress_bar) {
      space.add (this.length + 2, 0);
      process.stderr.write ('[');
      for (let index = 0; index < Math.floor (progress); index++)
        process.stderr.write (this.color (this.form[this.form.length - 1]));

      if (progress % 1 !== 0) {
        const last_form = Math.floor (
          this.form.length * (progress - Math.floor (progress))
        );
        process.stderr.write (this.color (this.form[last_form]));
      }
      for (let index = Math.ceil (progress); index < this.length; index++)
        process.stderr.write (' ');

      process.stderr.write (']');
    }

    if (this.display_percentage) {
      const percentage = ` ${Math.round (this.progress * 100)}%`;
      process.stderr.write (percentage);
      space.add (percentage.length, 0);
    }
    if (this.display_remaining && this.task_id.length > 0) {
      const remaining = this.remaining_time_formatted;
      process.stderr.write (` ${remaining}`);
      space.add (remaining.length + 1, 0);
    }
    return space;
  }
}
