import chalk from 'chalk';
import { BaseTask } from './BaseTask';

export class Task extends BaseTask {
  public color = chalk.white;
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

  public present () {
    if (this.completed)
      this.present_completed = true;
    const index = Math.min (
      this.form.length - 1,
      Math.floor (this.progress * this.form.length)
    );
    process.stderr.write (this.color (this.form[index]));
  }
}
