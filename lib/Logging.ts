import chalk, { Chalk } from 'chalk';

export interface LogEntrySettings {
  message: string;
  message_color?: Chalk;
  label?: string;
  label_color?: Chalk;
}

export type Logger = (message: LogEntrySettings | string) => void;

export class LogEntry {
  public message: string;
  public message_color: Chalk;
  public label: string;
  public label_color: Chalk;

  constructor (settings: LogEntrySettings) {
    this.message = settings.message;
    this.message_color = settings.message_color || chalk.white;
    this.label = settings.label || '';
    this.label_color = settings.label_color || chalk.white;
  }

  public print () {
    if (this.label.length > 0) {
      process.stdout.write (this.label_color (this.label));
      process.stdout.write (' ');
    }
    process.stdout.write (this.message_color (this.message));
    process.stdout.write ('\n');
  }
}
