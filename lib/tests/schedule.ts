import os from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { TaskSchedule, TaskScheduler, time_store } from '../index';
import { random_delay } from './util';

export async function run_schedule () {
  await time_store.use_file (join (
    os.tmpdir (),
    'tasks_schedule_time_store.json'
  ));

  const scheduler = new TaskScheduler;
  scheduler.label = 'Running Schedule';
  for (let i = 0; i < 10; i++) {
    const schedule = new TaskSchedule (
      i.toString (),
      async (task, next, logger) => {
        task.label.value = `Task ${task.task_id}`;
        task.label.length = 10;
        logger (`task ${task.task_id} starting`);
        await random_delay ();
        if (Math.random () > 0.5) {
          logger (`task ${task.task_id} cleaning up`);
          task.color = chalk.green;
          next ();
        }
        await random_delay ();
        logger (`task ${task.task_id} finishing`);
      }
    );
    scheduler.schedules.push (schedule);
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
