import chalk from 'chalk';
import { ITask, TaskState } from './Task';
import { LabelledTask } from './LabelledTask';
import { Spinner } from './Spinner';

export class TaskHorizontal extends LabelledTask implements ITask {
  public progress = 0;
  public completed = false;
  public present_completed = false;
  public length = 10;
  public display_percentage = true;
  public display_spinner = true;
  public display_progress_bar = true;
  public state: TaskState = 'running';

  private spinner = (new Spinner);

  public color = chalk.white;
  public form = [
    '⡇',
    '⣿'
  ];

  public present () {
    if (this.completed) {
      if (this.state === 'running')
        this.state = 'successful';
      this.spinner.present (this.state);
      this.present_label (true);
      this.present_completed = true;
      return;
    }

    const progress = this.length * this.progress;

    if (this.display_spinner)
      this.spinner.present (this.state);

    this.present_label ();

    if (this.display_progress_bar) {
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

    if (this.display_percentage)
      process.stderr.write (` ${Math.round (this.progress * 100)}%`);
  }
}
