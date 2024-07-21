import { Spinner } from './Spinner';
import { TaskLabel } from './TaskLabel';
import { TaskList } from './TaskList';

export class TaskListHorizontal extends TaskList {
  public display_percentage = true;
  public display_spinner = true;
  private _label = (new TaskLabel);

  public get label () {
    return this._label;
  }

  private spinner = (new Spinner);

  protected do_present () {
    if (this.completed) {
      this.spinner.present (this.state);
      this.label.present (true);
      this.present_completed = true;
      return;
    }

    this.present_completed = false;
    if (this.display_spinner)
      this.spinner.present (this.state);

    this.label.present ();
    for (const task of this.tasks)
      task.present ();
    if (this.display_percentage)
      process.stderr.write (` ${Math.round (this.progress * 100)}%`);
  }
}
