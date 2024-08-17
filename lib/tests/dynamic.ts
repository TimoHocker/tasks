/* eslint-disable max-lines-per-function, no-await-in-loop, max-statements */
import assert from 'assert';
import {
  Task, TaskHorizontal, StandaloneTask,
  TaskListHorizontal, TaskListVertical
} from '../index';
import { delay } from './util';


export async function dynamic_test () {
  const list_vertical = (new TaskListVertical);
  list_vertical.clear_completed = true;

  let task1 = (new TaskHorizontal);
  task1.label.value = 'Task 1';
  task1.label.length = 10;
  list_vertical.tasks.push (task1);

  let task2 = (new TaskHorizontal);
  task2.label.value = 'Task 2';
  task2.label.length = 10;
  list_vertical.tasks.push (task2);

  const summary = (new TaskListHorizontal);
  list_vertical.tasks.push (summary);

  list_vertical.update ();

  const uncompleted: StandaloneTask[] = [
    task1,
    task2
  ];

  summary.tasks.push (
    ...uncompleted.map ((task) => {
      const t = (new Task);
      t.sync_task = task;
      return t;
    })
  );

  for (let i = 0; i < 10; i++) {
    if (Math.random () > 0.5) {
      const task = uncompleted.shift ();
      assert (typeof task !== 'undefined', 'Task must be defined');
      task.completed = true;
      task.state = 'successful';
      task.progress = 1;
    }

    task2.progress = 0.5;
    task1 = task2;
    task2 = (new TaskHorizontal);
    uncompleted.push (task2);
    const sumtask = (new Task);
    sumtask.sync_task = task2;
    summary.tasks.push (sumtask);
    task2.label.value = `Task ${i + 3}`;
    task2.label.length = 10;
    if (Math.random () > 0.2)
      list_vertical.tasks.unshift (task2);
    else
      list_vertical.tasks.splice (list_vertical.tasks.length - 1, 0, task2);

    await delay (1000);
  }
  for (let i = 0; i < 400; i++) {
    const task = new Task;
    summary.tasks.push (task);
    uncompleted.push (task);
    if (Math.random () > 0.5)
      task.progress = Math.random ();
  }
  while (uncompleted.length > 0) {
    const task = uncompleted[0];
    assert (typeof task !== 'undefined', 'Task must be defined');
    if (task.progress > 0.9) {
      task.completed = true;
      task.progress = 1;
      list_vertical.log (`${uncompleted.length} tasks left`);
      uncompleted.shift ();
    }
    else { task.progress += 0.1; }
    await delay (2);
  }
  await list_vertical.await_end ();
}
