/* eslint-disable max-lines-per-function, max-statements, no-console */
import assert from 'assert';
import { join } from 'path';
import os from 'os';
import chalk from 'chalk';
import { time_store } from '../TimeStore';

import {
  TaskListVertical,
  TaskListHorizontal,
  TaskHorizontal,
  Task
} from '../index';
import { mock_task } from './util';

export async function linear_test () {
  const list_vertical = (new TaskListVertical);

  const tasks: Promise<void>[] = [];

  for (let i = 0; i < 5; i++) {
    const lh = (new TaskListHorizontal);
    lh.display_percentage = true;
    lh.label.value = `Task ${i}`;
    lh.label.length = 10;
    for (let j = 0; j < 10; j++) {
      const task = (new Task);
      lh.tasks.push (task);
      tasks.push (mock_task (task, list_vertical, i));
    }
    list_vertical.tasks.push (lh);
  }
  for (let i = 0; i < 5; i++) {
    const task = (new TaskHorizontal);
    task.display_percentage = true;
    task.label.value = `Task ${i + 5}`;
    task.label.length = 10;
    task.length = 5 + (i * 3);
    tasks.push (mock_task (task, list_vertical, i));
    list_vertical.tasks.push (task);
  }

  const static_task1 = (new TaskHorizontal);
  static_task1.label.value = 'Static Task';
  static_task1.label.length = 10;
  static_task1.length = 10;
  static_task1.progress = 0;
  list_vertical.tasks.push (static_task1);

  const static_task2 = (new TaskHorizontal);
  static_task2.label.value = 'Static Task';
  static_task2.label.length = 10;
  static_task2.length = 10;
  static_task2.progress = 0.356;
  list_vertical.tasks.push (static_task2);

  const static_task3 = (new TaskHorizontal);
  static_task3.label.value = 'Static Task';
  static_task3.label.length = 10;
  static_task3.length = 10;
  static_task3.progress = 0;
  list_vertical.tasks.push (static_task3);

  const static_task4 = (new TaskHorizontal);
  static_task4.label.value = 'Static Task';
  static_task4.label.length = 10;
  static_task4.length = 10;
  static_task4.progress = 0.99999;
  list_vertical.tasks.push (static_task4);

  const static_task5 = (new TaskHorizontal);
  static_task5.label.value = 'Static Task';
  static_task5.label.length = 10;
  static_task5.length = 10;
  static_task5.progress = 1;
  list_vertical.tasks.push (static_task5);

  const static_lh = (new TaskListHorizontal);
  static_lh.display_percentage = true;
  static_lh.label.value = 'Static Task';
  static_lh.label.length = 10;
  static_lh.tasks.push ((new Task));
  static_lh.tasks.push ((new Task));
  static_lh.tasks[0].current = 0;
  static_lh.tasks[0].total = 1;
  static_lh.tasks[1].current = 1;
  static_lh.tasks[1].total = 9;
  list_vertical.tasks.push (static_lh);

  console.log ('start line 1');
  console.log ('start line 2');

  await time_store.use_file (join (os.tmpdir (), 'tasks_time_store.json'));
  time_store.set_fallback_to_average ();

  static_task1.task_id = 'task1';
  static_task1.progress_by_time = true;
  static_task1.start_timer ();

  static_task2.task_id = 'task2';
  static_task2.progress_by_time = true;
  static_task2.start_timer ();

  static_task3.task_id = 'task3';
  static_task3.time_by_progress = true;
  static_task3.start_timer ();

  const intv = setInterval (() => {
    static_task3.progress = Math.min (1, static_task3.progress + 0.002);
  }, 10);

  list_vertical.update ();

  await Promise.all (tasks);
  clearInterval (intv);
  static_task1.completed = true;
  static_task2.completed = true;
  static_task3.completed = true;
  static_task4.completed = true;
  static_task5.completed = true;
  static_lh.tasks[0].completed = true;
  static_lh.tasks[1].completed = true;

  list_vertical.log ({
    label:       'test',
    label_color: chalk.red,
    message:     'All tasks completed'
  });
  list_vertical.log ({
    label:       'test',
    label_color: chalk.red,
    message:     'very long message '.repeat (20)
  });
  list_vertical.log ({
    label:       'verylonglabel'.repeat (10),
    label_color: chalk.red,
    message:     'very long message '.repeat (20)
  });

  await list_vertical.await_end ();

  await static_task1.stop_timer (true);
  await static_task2.stop_timer (false);
  await static_task3.stop_timer (false);

  assert (static_task1.average_time > 0, 'Average time must be greater than 0');

  console.log ('end line 1');
  console.log ('end line 2');
}
