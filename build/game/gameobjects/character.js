import GameObject from "../../engine/gameobjects/gameobject.js";
import {getZIndex, GMULTX, GMULTY, round} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
export default class Character extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.underBricks = [];
    this.animWidth = 0;
    this.animHeight = 0;
    this.animTrack = 0;
    this.timer = 0;
    this.speed = params.speed ?? 1;
    this.move = new Vect(1, 0);
    this._height = 2;
    this.checkCollision = true;
    this.imageRight = {
      image: this.engine.library.getImage(params.imageRight.name, params.imageRight.extension),
      offset: params.imageRight.offset
    };
    this.imageLeft = {
      image: this.engine.library.getImage(params.imageLeft.name, params.imageLeft.extension),
      offset: params.imageLeft.offset
    };
    this.animFrames = params.animFrames;
    this.animCount = params.animCount;
  }
  get height() {
    return this._height;
  }
  init(ctx, scenes) {
    const level = scenes.find((s) => s.name == "Level");
    if (!level)
      throw new Error("Can't find level");
    this.level = level;
    this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
    this.animWidth = this.imageRight.image.width / this.animFrames;
    this.animHeight = this.imageRight.image.height;
  }
  update(dt) {
    this.timer += dt;
    this.spos.x += this.move.x * this.speed * GMULTX * dt;
    if (Math.abs(this.spos.x) > GMULTX) {
      this.timer = 0;
      var dir = Math.sign(this.spos.x);
      this.spos.x -= GMULTX * dir;
      this.gpos.x += dir;
      this.zIndex = getZIndex(this.gpos, 2);
      this.level.sortGO();
      this.checkCollision = true;
      this.animTrack = ++this.animTrack % this.animCount;
    }
    if (this.checkCollision) {
      this.handleCollision();
      this.handleBricks();
      this.checkCollision = false;
    }
  }
  handleBricks() {
    this.underBricks.forEach((b) => b.pressure -= 1);
    this.underBricks = this.brickHandler.checkCollisionRow(this.gpos.getAdd({x: -1, y: 1}), 2);
    this.underBricks.forEach((b) => b.pressure += 1);
    this.brickHandler.isPressured = true;
  }
  handleCollision() {
  }
  reverse() {
    this.move.x *= -1;
    this.gpos.x += this.move.x;
  }
  draw(ctx) {
    ctx.translate(-this.spos.x, 0);
    ctx.drawImage(this.move.x > 0 ? this.imageRight.image : this.imageLeft.image, round((this.animTrack + this.timer * this.speed) * this.animWidth * this.animFrames / this.animCount - this.animWidth / 2, this.animWidth), 0, this.animWidth, this.animHeight, -GMULTX - (this.move.x > 0 ? this.imageRight.offset : this.imageLeft.offset), GMULTY - this.animHeight, this.animWidth, this.animHeight);
  }
}
//# sourceMappingURL=character.js.map
