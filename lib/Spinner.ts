import chalk from 'chalk';
import { TaskState } from './Task';

export class Spinner {
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

  private present_running () {
    process.stderr.write (
      `${chalk.cyan (this.spinner_form[this.spinner_index])} `
    );
    this.spinner_index = (this.spinner_index + 1) % this.spinner_form.length;
  }

  private present_failed () {
    process.stderr.write (chalk.red ('✗ '));
  }

  private present_successful () {
    process.stderr.write (chalk.green ('✓ '));
  }

  private present_skipped () {
    process.stderr.write (chalk.gray ('⦿ '));
  }

  public present (state: TaskState) {
    switch (state) {
      case 'failed':
        this.present_failed ();
        break;
      case 'successful':
        this.present_successful ();
        break;
      case 'skipped':
        this.present_skipped ();
        break;
      default:
        this.present_running ();
    }
  }
}
