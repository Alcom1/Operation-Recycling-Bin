import BrickPlate from "./brickplate.js";
const brickPlateFanOverride = Object.freeze({
  images: ["brick_plate", "brick_plate_fan"]
});
export default class BrickPlateFan extends BrickPlate {
  constructor(engine2, params) {
    super(engine2, Object.assign(params, brickPlateFanOverride));
  }
}
//# sourceMappingURL=brickplatefan.js.map
