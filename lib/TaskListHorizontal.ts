import { OccupiedSpace } from './Space';
import { Spinner } from './Spinner';
import { TaskLabel } from './TaskLabel';
import { TaskList } from './TaskList';

export class TaskListHorizontal extends TaskList {
  public display_percentage = true;
  public display_spinner = true;
  public horizontal_limit = (process.stderr.columns || 80) - 10;
  private _label = (new TaskLabel);

  public get label () {
    return this._label;
  }

  private spinner = (new Spinner);

  protected do_present_subtasks (space: OccupiedSpace) {
    for (const task of this.tasks) {
      if (space.width > this.horizontal_limit) {
        process.stderr.write ('\n  ');
        space.width = 2;
        space.height++;
      }
      space.add (task.present ());
    }
  }

  protected do_present (): OccupiedSpace {
    const space = new OccupiedSpace (0, 0);
    if (this.completed) {
      this.spinner.present (this.state);
      this.label.present (true);
      if (this.state !== 'successful')
        this.do_present_subtasks (space);
      this.present_completed = true;
      return space;
    }

    this.present_completed = false;
    if (this.display_spinner)
      space.add (this.spinner.present (this.state));

    space.add (this.label.present ());

    this.do_present_subtasks (space);
    if (this.display_percentage) {
      const percentage = ` ${Math.round (this.progress * 100)}%`;
      process.stderr.write (percentage);
      space.add (percentage.length, 0);
    }
    return space;
  }
}
