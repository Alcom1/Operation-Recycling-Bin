import {pathImg} from "../utilities/math.js";
export default class LibraryModule {
  constructor() {
    this.assetsImage = new Map();
    this.isLoaded = true;
  }
  getImage(name, extension) {
    const curr = this.assetsImage.get(name);
    if (curr == null) {
      this.isLoaded = false;
      const image = new Image();
      image.src = pathImg(name, extension);
      this.assetsImage.set(name, image);
      return image;
    }
    return curr;
  }
  getLoaded() {
    if (!this.isLoaded) {
      if (Array.from(this.assetsImage.values()).every((i) => i.complete)) {
        this.isLoaded = true;
      }
      return this.isLoaded;
    }
    return true;
  }
}
//# sourceMappingURL=library.js.map
