import Brick from "./brick.js";
export default class BrickPlate extends Brick {
  constructor(engine2, params) {
    super(engine2, {...params, ...{width: 4}});
    this.image = this.engine.library.getImage("brick_plate");
  }
}
//# sourceMappingURL=brickplate.js.map
