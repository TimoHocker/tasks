import assert from 'assert';
import { promises as fs } from 'fs';
import debug from 'debug';

const log = debug ('sapphirecode:tasks:TimeStore');

class TimeStore {
  private data: Record<string, number[]> = {};
  private file = '';
  private fallback = 0;

  public get_avg_time (key: string) {
    const sublog = log.extend ('get_avg_time');
    sublog (`Getting average time for ${key}`);
    const data = this.data[key];
    if (!Array.isArray (data) || data.length === 0) {
    sublog (`No data found for ${key}, falling back to ${this.fallback}`);
      return this.fallback;
    }
    const result =  data.reduce ((acc, val) => acc + val, 0) / data.length;
    sublog (`Average time for ${key}: ${result}`);
    return result;
  }

  public set fallback_time (time: number) {
    const sublog = log.extend ('set_fallback_time');
    sublog (`Setting fallback time to ${time}`);
    this.fallback = time;
  }

  public set_fallback_to_average (task_ids: string[] = []): void {
    const sublog = log.extend ('set_fallback_to_average');
    sublog ('Setting fallback time to average');
    this.fallback_time = 0;
    let count = 0;
    let total = 0;
    const tasks = task_ids.length === 0 ? Object.keys (this.data) : task_ids;
    for (const task of tasks) {
      const time = this.get_avg_time (task);
      if (time <= 0)
        continue;
      total += time;
      count++;
    }
    if (count === 0){
      sublog ('No tasks found');
      return;
    }
    this.fallback_time = total / count;
    sublog (`Fallback time set to ${this.fallback}`);
  }

  public async set_time (key: string, time: number): Promise<void> {
    const sublog = log.extend ('set_time');
    sublog (`Adding time for ${key}: ${time}`);
    if (!Array.isArray (this.data[key]))
      this.data[key] = [];
    this.data[key].push (time);
    if (this.data[key].length > 10)
      this.data[key].shift ();
    await this.save ();
  }

  private async save (): Promise<void> {
    const sublog = log.extend ('save');
    if (this.file.length === 0) {
      sublog ('No file set');
      return;
    }
    sublog (`Saving ${Object.keys(this.data).length} entries to ${this.file}`);
    await fs.writeFile (this.file, JSON.stringify (this.data));
  }

  private async load (): Promise<void> {
    const sublog = log.extend ('load');
    assert (this.file.length > 0, 'File must be set');
    sublog (`Loading data from ${this.file}`);
    try {
      this.data = JSON.parse (await fs.readFile (this.file, 'utf8'));
      sublog (`Loaded ${Object.keys(this.data).length} entries`);
    }
    catch {
      sublog('loading failed, fallback to empty data');
      this.data = {};
    }
  }

  public async use_file (file: string): Promise<void> {
    this.file = file;
    await this.load ();
  }
}

export const time_store = (new TimeStore);
