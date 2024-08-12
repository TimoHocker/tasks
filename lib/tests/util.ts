import chalk from 'chalk';

import { ITask, TaskListVertical } from '../index';

export function delay (time: number) {
  return new Promise ((resolve) => setTimeout (resolve, time));
}

export async function mock_task (
  task: ITask,
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
      (task as unknown as Record<string, unknown>).color = chalk.blue;
    if (add % 3 === 0) {
      if (add > 0) {
        list.log ({
          label:   `task ${add}`,
          message: `Progress Log: ${Math.round (task.progress * 100)}%
  newline asd`,
          label_color:   chalk.blue,
          message_color: chalk.red
        });
      }
      else {
        list.log (`Progress Log: ${Math.round (task.progress * 100)}%`);
      }
    }
    // eslint-disable-next-line no-await-in-loop
    await delay (1000);
  }
  if (Math.random () > 0.8)
    task.state = 'failed';

  if (Math.random () > 0.8)
    task.state = 'skipped';

  task.completed = true;
  (task as unknown as Record<string, unknown>).color = chalk.green;
}
