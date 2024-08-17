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
      id:      `test_${i}`,
      process: async (task, next, logger) => {
        logger (`task ${task.task_id} starting`);
        logger (`task ${task.task_id} total: ${task.total
        } time: ${task.remaining_time_formatted} avg: ${task.average_time}`);
        await random_delay ();
        if (Math.random () > 0.5) {
          logger (`task ${task.task_id} cleaning up`);
          task.color = chalk.cyan;
          /* eslint-disable-next-line callback-return */
          next ();
        }
        await random_delay ();
        logger (`task ${task.task_id} finishing`);
        task.color = null;
      },
      progress_by_time: true,
      label:            `Task ${i}`
    });
  }
  scheduler.schedules[0].dependencies = [
    'test_1',
    'test_5'
  ];
  scheduler.schedules[1].dependencies = [
    'test_2',
    'test_3'
  ];
  scheduler.schedules[2].dependencies = [ 'test_4' ];
  await scheduler.run ();
}
