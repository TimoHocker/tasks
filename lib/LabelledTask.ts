export class LabelledTask {
  public label: string = '';
  public label_length = 0;

  private get cut_label() {
    if (this.label_length === 0) return this.label;
    if (this.label.length >= this.label_length)
      return this.label.substr(0, this.label_length);
    return this.label.padEnd(this.label_length, ' ');
  }

  protected present_label(full = false) {
    if (this.label.length === 0) return;
    if (full) process.stderr.write(`${this.label} `);
    else process.stderr.write(`${this.cut_label} `);
  }
}
