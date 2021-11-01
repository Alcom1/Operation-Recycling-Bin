import {BOUNDARY, GMULTY} from "../../engine/utilities/math.js";
import Animat from "./animation.js";
import Sprite from "./sprite.js";
const characterBotOverride = Object.freeze({
  image: "part_water",
  zIndex: 0
});
export default class WaterDrop extends Sprite {
  constructor(params) {
    super(Object.assign(params, characterBotOverride));
    this.speed = 500;
    this.animLand = this.parent.pushGO(new Animat({
      ...params,
      zModifier: 100,
      images: [{name: "part_water_land"}],
      speed: 2.5,
      frameCount: 6,
      isVert: true,
      isActive: false,
      isLoop: false
    }));
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
        this.doLandAnimation();
      }
    }
  }
  reset(gpos) {
    this.isActive = true;
    this.gpos = gpos.get();
    this.spos = {x: 0, y: 0};
  }
  resolveCollision() {
    this.doLandAnimation();
  }
  doLandAnimation() {
    this.isActive = false;
    this.animLand.isActive = true;
    this.animLand.reset(this.gpos);
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