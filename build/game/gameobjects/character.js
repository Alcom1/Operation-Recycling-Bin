import GameObject from "../../engine/gameobjects/gameobject.js";
import {GMULTX} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
import Animat from "./animation.js";
export default class Character extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.underBricks = [];
    this.animatGroupsIndex = 0;
    this.animatGroups = [[]];
    this.tags.push("Character");
    this.speed = params.speed ?? 1;
    this.move = new Vect(1, 0);
    this._height = params.height ?? 2;
    this.checkCollision = true;
    for (let i = -1; i <= 1; i++) {
      this.animatGroupCurr.push(this.parent.pushGO(new Animat(this.engine, {
        ...params,
        isLoop: false,
        zModifier: i < 1 ? 300 : 29,
        sliceIndex: i,
        framesSize: GMULTX * 2,
        gposOffset: {x: -1, y: 0}
      })));
    }
  }
  get height() {
    return this._height;
  }
  get animatGroupCurr() {
    return this.animatGroups[this.animatGroupsIndex];
  }
  get isNormalMovment() {
    return this.animatGroupsIndex == 0;
  }
  init(ctx, scenes) {
    const level = scenes.find((s) => s.name == "Level");
    if (!level)
      throw new Error("Can't find level");
    this.level = level;
    this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
    this.setCurrentGroup();
  }
  update(dt) {
    if (this.isNormalMovment) {
      this.handleNormalMovement(dt);
    } else {
      this.handleUniqueMovment(dt);
    }
    if (this.checkCollision) {
      this.handleCollision();
      this.handleBricks();
      this.animatGroupCurr.forEach((s) => s.resetSprite(this.gpos));
      this.level.sortGO();
      this.checkCollision = false;
    }
  }
  handleNormalMovement(dt) {
    this.spos.x += this.move.x * this.speed * GMULTX * dt;
    if (Math.abs(this.spos.x) > GMULTX) {
      var dir = Math.sign(this.spos.x);
      this.spos.x -= GMULTX * dir;
      this.gpos.x += dir;
      this.checkCollision = true;
    }
  }
  handleUniqueMovment(dt) {
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
    this.animatGroups[0].forEach((x) => x.setImageIndex(this.move.x));
  }
  setCurrentGroup(index) {
    index = index ?? this.animatGroupsIndex;
    this.animatGroupsIndex = index;
    this.animatGroups.forEach((sg, i) => sg.forEach((s) => {
      s.isActive = i == index;
      s.spos = {x: 0, y: 0};
      s.resetSprite(this.gpos);
      s.unPause();
    }));
    this.level.sortGO();
  }
  deactivate() {
    this.isActive = false;
    this.animatGroups.forEach((sg) => sg.forEach((s) => s.isActive = false));
    this.underBricks.forEach((b) => b.pressure -= 1);
    this.underBricks = [];
  }
}
//# sourceMappingURL=character.js.map
