import BrickPlate from "./brickplate.js";
const brickSuperOverride = Object.freeze({
  images: ["brick_super_off", "brick_super"],
  width: 2,
  isOn: true
});
export default class BrickSuper extends BrickPlate {
  constructor(engine2, params) {
    super(engine2, Object.assign(params, brickSuperOverride));
  }
  getColliders() {
    return super.getColliders().concat(this.isOn ? [{
      mask: 16,
      min: this.gpos.getAdd({x: 0, y: -1}),
      max: this.gpos.getAdd({x: this.width, y: 0})
    }] : []);
  }
  resolveCollision(mask) {
    if (mask & 16) {
      this.isOn = false;
      this.image = this.images[+this.isOn];
    }
  }
}
//# sourceMappingURL=bricksuper.js.map
