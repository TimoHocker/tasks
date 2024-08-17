import { OccupiedSpace } from './Space';
import { StandaloneTask } from './StandaloneTask';

export class Task extends StandaloneTask {
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

  protected do_present (): OccupiedSpace {
    if (this.completed)
      this.present_completed = true;
    const index = Math.min (
      this.form.length - 1,
      Math.floor (this.progress * this.form.length)
    );
    process.stderr.write (this.color (this.form[index]));
    return new OccupiedSpace (1, 0);
  }
}
