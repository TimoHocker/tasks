import { OccupiedSpace } from './Space';

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

  public present (full = false): OccupiedSpace {
    if (this.value.length === 0)
      return new OccupiedSpace (0, 0);
    let value = '';
    if (full)
      value = `${this.value} `;
    else
      value = `${this.cut_value} `;
    process.stderr.write (value);
    return new OccupiedSpace (value.length, 0);
  }
}
