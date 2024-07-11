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
    task.progress = i / duration;
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
  task.completed = true;
  task.color = chalk.green;
}

const tasks: Promise<void>[] = [];

for (let i = 0; i < 5; i++) {
  const lh = (new TaskListHorizontal);
  lh.display_percentage = true;
  lh.label = `Task ${i}`;
  lh.label_length = 10;
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
  task.label = `Task ${i + 5}`;
  task.label_length = 10;
  task.length = 5 + (i * 3);
  tasks.push (mock_task (task, list_vertical, i));
  list_vertical.tasks.push (task);
}

async function main () {
  /* eslint-disable no-console */
  console.log ('start line 1');
  console.log ('start line 2');

  list_vertical.update ();

  // await Promise.all (tasks);
  await list_vertical.await_end ();

  console.log ('end line 1');
  console.log ('end line 2');
}

main ();
