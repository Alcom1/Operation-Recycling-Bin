import {pathImg} from "../utilities/math.js";
export default class LibraryModule {
  constructor() {
    this.assetsImage = new Map();
    this.loadingCount = 0;
  }
  getImage(name, extension) {
    const curr = this.assetsImage.get(name);
    if (curr == null) {
      this.loadingCount++;
      const image = new Image();
      image.src = pathImg(name, extension);
      image.onload = (e) => this.loadingCount--;
      this.assetsImage.set(name, image);
      return image;
    }
    return curr;
  }
  getLoaded() {
    return this.loadingCount <= 0;
  }
}
//# sourceMappingURL=library.js.map
