import chalk from 'chalk';

export interface ITask {
  completed: boolean;
  progress: number;
  present(): void;
}

export class Task implements ITask {
  public progress: number = 0;
  public completed: boolean = false;

  public color = chalk.white();
  public form = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

  public present() {
    const index = Math.min(
      this.form.length - 1,
      Math.floor(this.progress * this.form.length)
    );
    process.stderr.write(this.color + this.form[index]);
  }
}
