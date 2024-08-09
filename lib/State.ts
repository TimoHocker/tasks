import chalk from "chalk";

export type TaskState =
  | 'failed'
  | 'paused'
  | 'running'
  | 'skipped'
  | 'successful';

export function color_by_state (state: TaskState) {
  switch (state) {
    case 'failed':
      return chalk.red;
    case 'paused':
      return chalk.gray;
    case 'running':
      return chalk.white;
    case 'skipped':
      return chalk.yellow;
    case 'successful':
      return chalk.green;
    default:
      throw new Error (`Unknown state: ${state}`);
  }
}
