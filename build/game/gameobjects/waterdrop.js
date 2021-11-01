import {BOUNDARY, GMULTY} from "../../engine/utilities/math.js";
import Sprite from "./sprite.js";
const characterBotOverride = Object.freeze({
  image: "part_water",
  zIndex: 0
});
export default class WaterDrop extends Sprite {
  constructor(params) {
    super(Object.assign(params, characterBotOverride));
    this.speed = 500;
    this.isActive = false;
  }
  init() {
    this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
  }
  update(dt) {
    this.spos.y += dt * this.speed;
    if (this.spos.y > GMULTY) {
      this.spos.y -= GMULTY;
      this.gpos.y += 1;
      if (this.gpos.y > BOUNDARY.maxy || this.brickHandler.checkCollisionRange(this.gpos, 0, 2, 1, 1)) {
        this.isActive = false;
      }
    }
  }
  reset(gpos) {
    this.isActive = true;
    this.gpos = gpos.get();
    this.spos = {x: 0, y: 0};
  }
  resolveCollision() {
    this.isActive = false;
  }
  getColliders() {
    return [{
      mask: 36,
      min: this.gpos,
      max: this.gpos.getAdd({x: 2, y: 1})
    }];
  }
}
//# sourceMappingURL=waterdrop.js.map
