import {Z_DEPTH} from "../../engine/utilities/math.js";
import Animat from "./animation.js";
import BrickPlate from "./brickplate.js";
const brickPlateFanOverride = Object.freeze({
  images: ["brick_plate", "brick_plate_fan"],
  width: 4
});
export default class BrickPlateFan extends BrickPlate {
  constructor(params) {
    super(Object.assign(params, brickPlateFanOverride));
    this.animations = [];
    this.beams = [];
    this.characters = [];
    for (let j = this.gpos.y - 1; j > 0; j--) {
      [0, 1].forEach((i) => {
        this.animations.push(this.parent.pushGO(new Animat({
          ...params,
          position: {x: this.gpos.x + i + 1, y: j},
          subPosition: {x: Z_DEPTH / 2 - 2, y: -Z_DEPTH / 2 + 2},
          zModifier: 1,
          images: [{name: "part_wind", offsetX: 0}],
          speed: 2,
          frameCount: 6,
          isLoop: true
        })));
      });
    }
  }
  init() {
    this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
    this.characters = this.engine.tag.get("Character", "Level");
    this.setBeams();
  }
  update() {
    this.beams.forEach((y, x) => {
      this.animations.forEach((a) => {
        if (a.gpos.x == this.gpos.x + x + 1) {
          a.isVisible = this.isOn && a.gpos.y >= y;
        }
      });
    });
  }
  setBeams() {
    this.beams = [1, 2].map((i) => {
      return this.brickHandler.checkCollisionRange({x: this.gpos.x + i, y: -1}, 0, this.gpos.y - 1, this.gpos.y - 1).toString(2).length;
    }).map((b, i) => {
      let ret = b;
      this.characters.forEach((c) => {
        if (c.gpos.y <= this.gpos.y && [1, 2].some((x) => x == c.gpos.x - this.gpos.x - i)) {
          ret = Math.max(ret, c.gpos.y - c.height + 3);
        }
      });
      return ret;
    });
  }
  getColliders() {
    this.setBeams();
    return super.getColliders().concat(this.isOn ? this.beams.map((b, i) => {
      return {
        mask: 8,
        min: {x: this.gpos.x + i + 1, y: b},
        max: this.gpos.getAdd({x: i + 2, y: 0})
      };
    }) : []);
  }
}
//# sourceMappingURL=brickplatefan.js.map
