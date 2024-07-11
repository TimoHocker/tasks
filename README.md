# @sapphirecode/tasks

version: 1.1.0

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
  lv.label = `Task ${i}`;
  lv.label_length = 10; // the label length is used to align the progress bars between all horizontal lists
  for (let j = 0; j < 10; j++) {
    const task = new Task;
    lv.tasks.push (task);
    mock_task (task, list);
  }
  list.tasks.push (lv);
}

// horizontal tasks can be used for single tasks with label and progress bar
const hz_task = new TaskHorizontal;
hz_task.label = "Single Task";
hz_task.label_length = 12;
list.tasks.push (hz_task);
mock_task (hz_task, list);

// call update once to render the task list
// the display will automatically stop, once all tasks are completed
list.update ();

await list.await_end (); // await the completion of all tasks
```

## License

MIT © Timo Hocker <timo@scode.ovh>
