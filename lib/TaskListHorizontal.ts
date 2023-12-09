import chalk from 'chalk';
import { ITask } from './Task';

export class TaskListHorizontal implements ITask {
  public tasks: ITask[] = [];
  public label = '';
  public label_length = 0;
  public display_percentage = true;
  public display_spinner = true;

  private spinner_index = 0;
  private spinner_form = [
    '⣾',
    '⣽',
    '⣻',
    '⢿',
    '⡿',
    '⣟',
    '⣯',
    '⣷'
  ];

  public present_completed = false;

  public get completed () {
    return this.tasks.length > 0
      && this.tasks.filter ((v) => !v.completed).length === 0;
  }

  public get progress () {
    if (this.tasks.length === 0)
      return 0;

    return (
      this.tasks.reduce ((acc, task) => acc + task.progress, 0)
      / this.tasks.length
    );
  }

  private get cut_label () {
    if (this.label_length === 0)
      return this.label;
    if (this.label.length >= this.label_length)
      return this.label.substr (0, this.label_length);
    return this.label.padEnd (this.label_length, ' ');
  }

  public present () {
    if (this.completed) {
      process.stderr.write (chalk.green ('✓ ') + this.label);
      this.present_completed = true;
      return;
    }

    this.present_completed = false;
    if (this.display_spinner) {
      process.stderr.write (
        `${chalk.cyan (this.spinner_form[this.spinner_index])} `
      );
      this.spinner_index = (this.spinner_index + 1) % this.spinner_form.length;
    }

    if (this.label.length > 0)
      process.stderr.write (`${this.cut_label} `);
    for (const task of this.tasks)
      task.present ();
    if (this.display_percentage)
      process.stderr.write (` ${Math.round (this.progress * 100)}%`);
  }
}
