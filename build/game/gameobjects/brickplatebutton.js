import BrickPlate from "./brickplate.js";
const brickButtonOverride = Object.freeze({
  images: ["brick_button_off", "brick_button_on"],
  width: 2
});
export default class BrickPlateButton extends BrickPlate {
  constructor(params) {
    super(Object.assign(params, brickButtonOverride));
    this.plates = [];
    this.timer = 0;
    this.waitDuration = 1.5;
  }
  init() {
    this.plates = this.engine.tag.get("BrickPlate", "Level").filter((p) => p.circuit == this.circuit);
    console.log(this.plates);
  }
  update(dt) {
    this.timer = this.timer > 0 ? this.timer - dt : 0;
  }
  getColliders() {
    return super.getColliders().concat([{
      mask: 128,
      min: this.gpos.getAdd({x: 0, y: -1}),
      max: this.gpos.getAdd({x: this.width, y: 0})
    }]);
  }
  resolveCollision(mask) {
    if (this.timer <= 0 && mask & 128) {
      this.setOnOff(!this.isOn);
      this.plates.forEach((p) => p.setOnOff(this.isOn));
      this.timer = this.waitDuration;
    }
  }
}
//# sourceMappingURL=brickplatebutton.js.map
