import {MASKS, Z_DEPTH} from "../../engine/utilities/math.js";
import Anim from "./anim.js";
import BrickTile from "./bricktile.js";
const BrickTileFanOverride = Object.freeze({
  images: ["brick_tile", "brick_tile_fan"],
  width: 4
});
export default class BrickTileFan extends BrickTile {
  constructor(params) {
    super(Object.assign(params, BrickTileFanOverride));
    this.animations = [];
    this.beams = [];
    this.characters = [];
    for (let j = this.gpos.y - 1; j > 0; j--) {
      [0, 1].forEach((i) => {
        this.animations.push(this.parent.pushGO(new Anim({
          ...params,
          zNoCompare: true,
          tags: ["Wind"],
          position: {x: this.gpos.x + i + 1, y: j},
          subPosition: {x: Z_DEPTH / 2 - 2, y: -Z_DEPTH / 2 + 2},
          images: [{name: "part_wind"}],
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
  }
  update() {
    this.setBeams();
  }
  setBeams() {
    this.beams = [1, 2].map((i) => {
      return this.brickHandler.checkCollisionRange({x: this.gpos.x + i, y: -1}, 1, 0, this.gpos.y - 1, this.gpos.y - 1).toString(2).length;
    }).map((b, i) => {
      let ret = b;
      this.characters.forEach((c) => {
        if (c.gpos.y <= this.gpos.y && [1, 2].some((x) => x == c.gpos.x - this.gpos.x - i)) {
          ret = Math.max(ret, c.gpos.y - c.height + 3);
        }
      });
      return ret;
    });
    this.beams.forEach((y, x) => {
      this.animations.forEach((a) => {
        if (a.gpos.x == this.gpos.x + x + 1) {
          a.isVisible = this.isOn && a.gpos.y >= y;
        }
      });
    });
  }
  getColliders() {
    return super.getColliders().concat(this.isOn ? this.beams.map((b, i) => {
      return {
        mask: MASKS.float,
        min: {x: this.gpos.x + i + 1, y: b},
        max: this.gpos.getAdd({x: i + 2, y: 0})
      };
    }) : []);
  }
}
//# sourceMappingURL=bricktilefan.js.map
