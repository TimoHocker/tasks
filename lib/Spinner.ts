import chalk from 'chalk';
import { color_by_state, TaskState } from './State';

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

  public present (state: TaskState) {
    let symbol = '';
    switch (state) {
      case 'failed':
        symbol = '✗';
        break;
      case 'successful':
        symbol = '✓';
        break;
      case 'skipped':
        symbol = '⦿';
        break;
      case 'paused':
        symbol = '⦿';
        break;
      default:
        break;
    }
    if (symbol.length > 0)
      process.stderr.write (`${color_by_state (state) (symbol)} `);
    else
      this.present_running ();
  }
}
