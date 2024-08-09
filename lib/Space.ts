export class OccupiedSpace {
  width = 0;
  height = 0;

  constructor (width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  private add_space (space: OccupiedSpace) {
    this.width += space.width;
    this.height += space.height;
  }

  private add_numbers (width: number, height: number) {
    this.width += width;
    this.height += height;
  }

  public add (width: OccupiedSpace | number, height = 0) {
    if (typeof width === 'number')
      this.add_numbers (width, height);
    else
      this.add_space (width);
  }
}
