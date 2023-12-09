import {ITask} from './Task';

export class TaskListHorizontal implements ITask {
  public tasks: ITask[] = [];

  public get completed() {
    return this.tasks.filter((v) => !v.completed).length === 0;
  }

  public get progress() {
    return (
      this.tasks.reduce((acc, task) => acc + task.progress, 0) /
      this.tasks.length
    );
  }

  public present() {
    for (const task of this.tasks) task.present();
  }
}
