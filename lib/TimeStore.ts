import assert from 'assert';
import { promises as fs } from 'fs';

class TimeStore {
  private data: Record<string, number[]> = {};
  private file = '';
  private fallback = 0;

  public get_avg_time (key: string) {
    const data = this.data[key];
    if (!Array.isArray(data) || data.length === 0)
      return this.fallback;
    return data.reduce ((acc, val) => acc + val, 0) / data.length;
  }

  public set fallback_time (time: number) {
    this.fallback = time;
  }

  public set_fallback_to_average (task_ids: string[] = []): void {
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
    if (count === 0)
      return;
    this.fallback_time = total / count;
  }

  public async set_time (key: string, time: number): Promise<void> {
    if (!Array.isArray(this.data[key]))
      this.data[key] = [];
    this.data[key].push (time);
    if (this.data[key].length > 10)
      this.data[key].shift ();
    await this.save ();
  }

  private async save (): Promise<void> {
    if (this.file.length === 0)
      return;
    await fs.writeFile (this.file, JSON.stringify (this.data));
  }

  private async load (): Promise<void> {
    assert (this.file.length > 0, 'File must be set');
    try {
      this.data = JSON.parse (await fs.readFile (this.file, 'utf8'));
    }
    catch {
      this.data = {};
    }
  }

  public async use_file (file: string): Promise<void> {
    this.file = file;
    await this.load ();
  }
}

export const time_store = (new TimeStore);
