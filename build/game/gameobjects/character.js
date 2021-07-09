import GameObject from "../../engine/gameobjects/gameobject.js";
import {GMULTX} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
import SpriteCharacter from "./spritecharacter.js";
export default class Character extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.underBricks = [];
    this.segmentIndex = 0;
    this.segments = [[]];
    this.speed = params.speed ?? 1;
    this.move = new Vect(1, 0);
    this._height = params.height ?? 2;
    this.checkCollision = true;
    for (let i = -1; i < 4; i++) {
      const segment = new SpriteCharacter(this.engine, {
        ...params,
        order: i,
        width: GMULTX
      });
      this.segmentsCurr.push(segment);
      this.parent.pushGO(segment);
    }
  }
  get height() {
    return this._height;
  }
  get segmentsCurr() {
    return this.segments[this.segmentIndex];
  }
  init(ctx, scenes) {
    const level = scenes.find((s) => s.name == "Level");
    if (!level)
      throw new Error("Can't find level");
    this.level = level;
    this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
  }
  update(dt) {
    this.spos.x += this.move.x * this.speed * GMULTX * dt;
    if (Math.abs(this.spos.x) > GMULTX) {
      var dir = Math.sign(this.spos.x);
      this.spos.x -= GMULTX * dir;
      this.gpos.x += dir;
      this.checkCollision = true;
    }
    if (this.checkCollision) {
      this.handleCollision();
      this.handleBricks();
      this.segmentsCurr.forEach((s) => s.updateSprite(this.gpos));
      this.level.sortGO();
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
    this.segmentsCurr.forEach((x) => x.direction = this.move.x);
  }
}
//# sourceMappingURL=character.js.map
