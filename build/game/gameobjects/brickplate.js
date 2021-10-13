import Brick from "./brick.js";
export default class BrickPlate extends Brick {
  constructor(engine2, params) {
    super(engine2, {...params, ...{width: 4}});
    this.image = this.engine.library.getImage("brick_plate");
  }
  getColliders() {
    return [{
      mask: 4,
      min: this.gpos.getAdd({x: 1, y: -1}),
      max: this.gpos.getAdd({x: this.width - 1, y: 0})
    }, {
      mask: 0,
      min: this.gpos.getAdd({x: 0, y: -1}),
      max: this.gpos.getAdd({x: this.width, y: 2})
    }];
  }
}
//# sourceMappingURL=brickplate.js.map
