export class TaskLabel {
  public value = '';
  public length = 0;

  private get cut_value () {
    if (this.length === 0)
      return this.value;
    if (this.value.length >= this.length)
      return this.value.substr (0, this.length);
    return this.value.padEnd (this.length, ' ');
  }

  public present (full = false) {
    if (this.value.length === 0)
      return;
    if (full)
      process.stderr.write (`${this.value} `);
    else
      process.stderr.write (`${this.cut_value} `);
  }
}
