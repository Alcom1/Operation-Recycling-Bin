import {pathImg} from "../utilities/math.js";
export default class LibraryModule {
  constructor() {
    this.assetsImage = new Map();
    this.loadingCount = 0;
  }
  getImage(name, extension) {
    const curr = this.assetsImage.get(name);
    return curr == null ? this.storeImage(name, pathImg(name, extension)) : curr;
  }
  getImageWithSrc(name, src) {
    const curr = this.assetsImage.get(name);
    return curr == null ? this.storeImage(name, src) : curr;
  }
  storeImage(name, src) {
    this.loadingCount++;
    const image = new Image();
    image.src = src;
    image.onload = (e) => this.loadingCount--;
    this.assetsImage.set(name, image);
    return image;
  }
  getLoaded() {
    return this.loadingCount <= 0;
  }
}
//# sourceMappingURL=library.js.map
