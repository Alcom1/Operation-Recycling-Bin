import BrickBase from "./brickbase.js";
export default class BrickPlate extends BrickBase {
  constructor(engine2, params) {
    super(engine2, {...params, ...{width: 4}});
    this.image = this.engine.library.getImage("brick_plate");
  }
}
//# sourceMappingURL=brickplate.js.map
