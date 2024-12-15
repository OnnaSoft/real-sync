

let isGray = false;

export class ColorManager {
  private isGray = false;

  setGray(isGray: boolean) {
    this.isGray = isGray;
  }

  getNextColor() {
    this.isGray = !this.isGray;
    return !this.isGray ? "bg-gray-50" : "bg-white";
  }
}
