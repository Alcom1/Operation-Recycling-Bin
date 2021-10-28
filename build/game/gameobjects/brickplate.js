import Brick from "./brick.js";
export default class BrickPlate extends Brick {
  constructor(engine2, params) {
    super(engine2, Object.assign(params));
    this.images = params.images.map((i) => i ? this.engine.library.getImage(i) : {});
    this.isOn = params.isOn;
    this.image = this.images[+params.isOn];
  }
  getColliders() {
    return [{
      mask: 0,
      min: this.gpos.getAdd({x: 0, y: -1}),
      max: this.gpos.getAdd({x: this.width, y: 2})
    }];
  }
}
//# sourceMappingURL=brickplate.js.map
