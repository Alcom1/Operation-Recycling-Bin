import BrickPlate from "./brickplate.js";
const brickButtonOverride = Object.freeze({
  images: ["brick_button_off", "brick_button_on"],
  width: 2
});
export default class BrickPlateButton extends BrickPlate {
  constructor(params) {
    super(Object.assign(params, brickButtonOverride));
    this.plates = [];
    this.isLock = false;
    this.isLeft = false;
  }
  init() {
    this.plates = this.engine.tag.get("BrickPlate", "Level").filter((p) => p.circuit == this.circuit);
  }
  update(dt) {
    if (this.isLeft) {
      this.isLock = false;
    }
    if (this.isLock) {
      this.isLeft = true;
    }
  }
  getColliders() {
    return super.getColliders().concat([{
      mask: 128,
      min: this.gpos.getAdd({x: 0, y: -1}),
      max: this.gpos.getAdd({x: this.width, y: 0})
    }]);
  }
  resolveCollision(mask) {
    if (mask & 128) {
      this.isLeft = false;
      if (!this.isLock) {
        var temp = !this.isOn;
        this.plates.forEach((p) => p.setOnOff(temp));
        this.isLock = true;
      }
    }
  }
}
//# sourceMappingURL=brickplatebutton.js.map
