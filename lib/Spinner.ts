import chalk from "chalk";

export class Spinner {
  private spinner_index = 0;
  private spinner_form = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];

  public present () {
    process.stderr.write (
      `${chalk.cyan(this.spinner_form[this.spinner_index])} `
    );
    this.spinner_index = (this.spinner_index + 1) % this.spinner_form.length;
  }
}
