import os from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { TaskScheduler, time_store } from '../index';
import { random_delay } from './util';

export async function run_schedule () {
  await time_store.use_file (join (
    os.tmpdir (),
    'tasks_schedule_time_store.json'
  ));

  const scheduler = new TaskScheduler;
  scheduler.label = 'Running Schedule';
  for (let i = 0; i < 10; i++) {
    scheduler.add ({
      id:      i.toString (),
      process: async (task, next, logger) => {
        task.label.value = `Task ${task.task_id}`;
        task.label.length = 10;
        logger (`task ${task.task_id} starting`);
        logger (`task ${task.task_id} total: ${task.total
        } time: ${task.remaining_time_formatted} avg: ${task.average_time}`);
        await random_delay ();
        if (Math.random () > 0.5) {
          logger (`task ${task.task_id} cleaning up`);
          task.color = chalk.green;
          /* eslint-disable-next-line callback-return */
          next ();
        }
        await random_delay ();
        logger (`task ${task.task_id} finishing`);
      },
      progress_by_time: true
    });
  }
  scheduler.schedules[0].dependencies = [
    '1',
    '5'
  ];
  scheduler.schedules[1].dependencies = [
    '2',
    '3'
  ];
  scheduler.schedules[2].dependencies = [ '4' ];
  await scheduler.run ();
}
