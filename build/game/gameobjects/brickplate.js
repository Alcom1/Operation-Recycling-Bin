import Animat from "./animation.js";
import Brick from "./brick.js";
export default class BrickPlate extends Brick {
  constructor(engine2, params) {
    super(engine2, {...params, ...{width: 4}});
    this.image = this.engine.library.getImage("brick_plate");
    this.parent.pushGO(new Animat(this.engine, {
      ...params,
      subPosition: {x: 0, y: -25},
      zIndex: this.zIndex,
      images: [{name: "brick_plate_hot", offsetX: 0}],
      speed: 2,
      framesSize: 55,
      frameCount: 7,
      isVert: true
    }));
  }
  draw() {
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
