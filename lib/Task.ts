import chalk from 'chalk';

export interface ITask {
  completed: boolean;
  present_completed: boolean;
  progress: number;
  present(): void;
}

export class Task implements ITask {
  public progress = 0;
  public completed = false;
  public present_completed = false;

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
