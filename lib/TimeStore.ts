import assert from 'assert';
import { promises as fs } from 'fs';

class TimeStore {
  private data: Record<string, number[]> = {};
  private file = '';

  public get_avg_time (key: string) {
    const data = this.data[key];
    if (!data || data.length === 0)
      return 0;
    return data.reduce ((acc, val) => acc + val, 0) / data.length;
  }

  public async set_time (key: string, time: number): Promise<void> {
    if (!this.data[key])
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
