import {BOUNDARY, Faction, GMULTY, MASKS} from "../../engine/utilities/math.js";
import Anim from "./anim.js";
import Sprite from "./sprite.js";
const waterDropOverride = Object.freeze({
  image: "part_water",
  zIndex: 0
});
export default class WaterDrop extends Sprite {
  constructor(params) {
    super(Object.assign(params, waterDropOverride));
    this.speed = 500;
    this.slipDuration = 0.4;
    this.slipTimer = 0;
    this.zIndex = 2500;
    this.animLand = this.parent.pushGO(new Anim({
      ...params,
      zIndex: this.zIndex,
      images: [{name: "part_water_land"}],
      speed: 2.5,
      frameCount: 6,
      isVert: true,
      isActive: false,
      isLoop: false
    }));
    this.animSlip = this.parent.pushGO(new Anim({
      ...params,
      zIndex: this.zIndex,
      images: [{name: "part_water_slip"}],
      speed: 1 / this.slipDuration,
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
    if (this.slipTimer < this.slipDuration) {
      this.slipTimer += dt;
      return;
    } else {
      this.animSlip.isActive = false;
    }
    this.spos.y += dt * this.speed;
    if (this.spos.y > GMULTY) {
      this.spos.y -= GMULTY;
      this.gpos.y += 1;
      if (this.gpos.y > BOUNDARY.maxy || this.brickHandler.checkCollisionRange(this.gpos, 1, 0, 2, 1, void 0, Faction.HOSTILE)) {
        this.doLandAnimation();
      }
    }
  }
  draw(ctx) {
    if (this.slipTimer >= this.slipDuration) {
      super.draw(ctx);
    }
  }
  reset(gpos) {
    this.isActive = true;
    this.gpos = gpos.get();
    this.spos.setToZero();
    this.slipTimer = 0;
    this.animSlip.isActive = true;
    this.animSlip.reset(this.gpos);
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
      mask: MASKS.water | MASKS.death,
      min: this.gpos,
      max: this.gpos.getAdd({x: 2, y: 1})
    }];
  }
}
//# sourceMappingURL=waterdrop.js.map
