import chalk from 'chalk';
import {ITask} from './Task';

export class TaskListHorizontal implements ITask {
  public tasks: ITask[] = [];
  public label: string = '';
  public label_length: number = 0;
  public display_percentage: boolean = true;
  public display_spinner: boolean = true;

  private spinner_index = 0;
  private spinner_form = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];

  public present_completed: boolean = false;

  public get completed() {
    return this.tasks.filter((v) => !v.completed).length === 0;
  }

  public get progress() {
    return (
      this.tasks.reduce((acc, task) => acc + task.progress, 0) /
      this.tasks.length
    );
  }

  private get cut_label() {
    if (this.label_length === 0) return this.label;
    if (this.label.length >= this.label_length)
      return this.label.substr(0, this.label_length);
    return this.label.padEnd(this.label_length, ' ');
  }

  public present() {
    if (this.completed) {
      process.stderr.write(chalk.green('✓ ') + this.label);
      this.present_completed = true;
      return;
    }
    if (this.display_spinner) {
      process.stderr.write(
        chalk.cyan(this.spinner_form[this.spinner_index]) + ' '
      );
      this.spinner_index = (this.spinner_index + 1) % this.spinner_form.length;
    }

    if (this.label.length > 0) process.stderr.write(this.cut_label + ' ');
    for (const task of this.tasks) task.present();
    if (this.display_percentage) {
      process.stderr.write(' ' + Math.round(this.progress * 100) + '%');
    }
  }
}
