import assert from 'assert';
import chalk from 'chalk';
import { Task } from './Task';
import { TaskListVertical } from './TaskListVertical';
import { TaskListHorizontal } from './TaskListHorizontal';
import { TaskHorizontal } from './TaskHorizontal';

const list_vertical = (new TaskListVertical);

async function mock_task (
  task: Task,
  list: TaskListVertical,
  add: number
): Promise<void> {
  const duration = (Math.random () * 2) + 2 + add;
  for (let i = 0; i < duration; i++) {
    if (i > duration / 10) {
      task.state = 'running';
      task.progress = i / duration;
    }
    else {
      task.state = 'paused';
    }
    if (task.progress > 0.8)
      task.color = chalk.blue;
    if (add % 3 === 0) {
      if (add > 0) {
        list.log ({
          label:         `task ${add}`,
          message:       `Progress Log: ${Math.round (task.progress * 100)}%
  newline asd`,
          label_color:   chalk.blue,
          message_color: chalk.red
        });
      }
      else { list.log (`Progress Log: ${Math.round (task.progress * 100)}%`); }
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise ((resolve) => setTimeout (resolve, 1000));
  }
  if (Math.random () > 0.8)
    task.state = 'failed';

  if (Math.random () > 0.8)
    task.state = 'skipped';

  task.completed = true;
  task.color = chalk.green;
}

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
static_task3.progress = 0.8;
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
static_lh.tasks.push (new Task);
static_lh.tasks.push (new Task);
static_lh.tasks[0].current = 0;
static_lh.tasks[0].total = 1;
static_lh.tasks[1].current = 1;
static_lh.tasks[1].total = 9;
list_vertical.tasks.push (static_lh);

async function main () {
  /* eslint-disable no-console */
  console.log ('start line 1');
  console.log ('start line 2');

  static_task1.task_id = 'task1';
  static_task1.start_timer ();

  list_vertical.update ();

  await Promise.all (tasks);
  static_task1.completed = true;
  static_task2.completed = true;
  static_task3.completed = true;
  static_task4.completed = true;
  static_task5.completed = true;
  static_lh.tasks[0].completed = true;
  static_lh.tasks[1].completed = true;
  await list_vertical.await_end ();

  await static_task1.stop_timer (true);

  assert (static_task1.average_time > 0, 'Average time must be greater than 0');

  console.log ('end line 1');
  console.log ('end line 2');
}

main ();
