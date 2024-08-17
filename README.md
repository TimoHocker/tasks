# @sapphirecode/tasks

version: 2.1.0

Progress displays for large amounts of tasks

## Installation

npm:

> npm i --save @sapphirecode/tasks

yarn:

> yarn add @sapphirecode/tasks

## Usage

```typescript
// Create at least one vertical task list to contain all your tasks
const list = new TaskListVertical;

// Have some asychronous task, that can send progress updates
async function mock_task (task: Task, list: TaskListVertical): Promise<void> {
  const duration = (Math.random () * 10) + 2;
  for (let i = 0; i < duration; i++) {
    // set the task progress between 0.0 and 1.0
    task.progress = i / duration;
    if (task.progress > 0.8)
      task.color = chalk.blue; // change the color of the task at any time

    list.log({ // Log any messages without affecting the progress display
      label: 'task log output',
      message: `Progress Log: ${Math.round(task.progress * 100)}%`,
      label_color: chalk.blue,
      message_color: chalk.red,
    });

    await new Promise ((resolve) => setTimeout (resolve, 1000));
  }
  task.completed = true; // mark the task as completed
  task.color = chalk.green;
}

// start your tasks
for (let i = 0; i < 10; i++) {
  // horizontal task lists can be used to group tasks and give them a label
  const lv = new TaskListHorizontal;
  lv.label.value = `Task ${i}`;
  lv.label.length = 10; // the label length is used to align the progress bars between all horizontal lists
  for (let j = 0; j < 10; j++) {
    const task = new Task;
    lv.tasks.push (task);
    mock_task (task, list);
  }
  list.tasks.push (lv);
}

time_store.use_file ('time_store.json'); // store the average task time in a file

// horizontal tasks can be used for single tasks with label and progress bar
const hz_task = new TaskHorizontal;
hz_task.task_id = 'test_task'; // Task id is used to store the average task time.
hz_task.label.value = "Single Task";
hz_task.label.length = 12;
hz_task.progress_by_time = true;
list.tasks.push (hz_task);
hz_task.start_timer(); // start the timer to measure the task time, also necessary to display the estimated time remaining

// calling stop_timer(true) will store the average task time in the time store and save it to the file if specified
// calling stop_timer(false) will only stop and reset the timer without saving it to the time store
mock_task (hz_task, list).then(async () => await hz_task.stop_timer(true));

// call update once to render the task list
// the display will automatically stop, once all tasks are completed
list.update ();

await list.await_end (); // await the completion of all tasks
```

### Scheduled Tasks

Scheduled tasks will automatically create a progress bar for each task and a summary at the bottom of the console.
Dependencies are automatically managed and tasks can run in parallel.

```typescript
const scheduler = new TaskScheduler;
scheduler.label = 'Scheduled Tasks';
// optional maximum number of parallel tasks (default: 16)
scheduler.max_parallel = 2;

// create a list of tasks with dependencies
scheduler.add({
  id: 'task1',
  label: 'Task 1',
  process: async (task, next, logger) => {
    logger ('Task 1 started');
    await new Promise ((resolve) => setTimeout (resolve, 1000));
    logger ('Task 1 cleaning up');
    // when calling next, all dependent tasks can be started while the current one is doing cleanup jobs
    next ();
    await new Promise ((resolve) => setTimeout (resolve, 500));
    logger ('Task 1 finished');
  },
  progress_by_time: true,
});
scheduler.add({
  id: 'task2',
  label: 'Task 2',
  process: async (task, next, logger) => {
    logger ('Task 2 started');
    await new Promise ((resolve) => setTimeout (resolve, 500));
    logger ('Task 2 finished');
  },
  progress_by_time: true,
});
scheduler.add({
  id: 'task3',
  label: 'Task 3',
  process: async (task, next, logger) => {
    logger ('Task 3 started');
    await new Promise ((resolve) => setTimeout (resolve, 500));
    logger ('Task 3 finished');
    task.completed = true;
  },
  dependencies: ['task1', 'task2'], // task 3 will only start, once task 1 and 2 are completed
  progress_by_time: true,
});

await scheduler.run (); // start the scheduler
```

## License

MIT © Timo Hocker <timo@scode.ovh>
