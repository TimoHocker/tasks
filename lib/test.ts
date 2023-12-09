import chalk from "chalk";
import { Task } from "./Task";
import { TaskListVertical } from "./TaskListVertical";
import { TaskListHorizontal } from "./TaskListHorizontal";

const list = new TaskListVertical;

async function mock_task(task: Task): Promise<void> {
  const duration = Math.random() * 30 + 10;
  for (let i = 0; i < duration; i++) {
    task.progress = i / duration;
    if (task.progress > 0.8)
      task.color = chalk.blue();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  task.completed = true;
  task.color = chalk.green();
}

for (let i = 0; i < 10; i++) {
  const lv = new TaskListHorizontal;
  for (let j = 0; j < 10; j++) {
    const task = new Task;
    lv.tasks.push(task);
    mock_task(task);
  }
  list.tasks.push(lv);
}

list.update();
