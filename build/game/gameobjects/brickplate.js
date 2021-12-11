import Brick from "./brick.js";
export default class BrickPlate extends Brick {
  constructor(params) {
    super(params);
    this.isOn = false;
    this.tags.push("BrickPlate");
    this.images = params.images.map((i) => i ? this.engine.library.getImage(i) : {});
    this.isOn = params.isOn ?? true;
    this.image = this.images[+this.isOn];
    this.circuit = params.circuit;
    console.log(this.tags);
  }
  setOnOff(state) {
    this.isOn = state;
    this.image = this.images[+this.isOn];
  }
  getColliders() {
    return !this.isGrey || this.isSelected ? [] : [{
      mask: 0,
      min: this.gpos.getAdd({x: 0, y: -1}),
      max: this.gpos.getAdd({x: this.width, y: 2})
    }];
  }
}
//# sourceMappingURL=brickplate.js.map
