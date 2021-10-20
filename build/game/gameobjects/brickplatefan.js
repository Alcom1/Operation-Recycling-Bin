import BrickPlate from "./brickplate.js";
const brickPlateFanOverride = Object.freeze({
  images: ["brick_plate", "brick_plate_fan"]
});
export default class BrickPlateFan extends BrickPlate {
  constructor(engine2, params) {
    super(engine2, Object.assign(params, brickPlateFanOverride));
  }
  init() {
    this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
  }
  getColliders() {
    var beams = [1, 2].map((i) => {
      return this.brickHandler.checkCollisionRange({x: this.gpos.x + i, y: 0}, 0, this.gpos.y - 1, this.gpos.y - 1).toString(2).length;
    });
    return super.getColliders().concat(this.isOn ? beams.map((b, i) => {
      return {
        mask: 8,
        min: {x: this.gpos.x + i + 1, y: b},
        max: this.gpos.getAdd({x: i + 2, y: 0})
      };
    }) : []);
  }
}
//# sourceMappingURL=brickplatefan.js.map
