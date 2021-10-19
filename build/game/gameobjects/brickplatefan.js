import BrickPlate from "./brickplate.js";
const brickPlateFanOverride = Object.freeze({
  images: ["brick_plate", "brick_plate_fan"]
});
export default class BrickPlateFan extends BrickPlate {
  constructor(engine2, params) {
    super(engine2, Object.assign(params, brickPlateFanOverride));
  }
  getColliders() {
    return super.getColliders().concat(this.isOn ? [{
      mask: 8,
      min: this.gpos.getAdd({x: 1, y: -1}),
      max: this.gpos.getAdd({x: this.width - 1, y: 0})
    }] : []);
  }
}
//# sourceMappingURL=brickplatefan.js.map
