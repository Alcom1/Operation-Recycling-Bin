import GameObject from "../../engine/gameobjects/gameobject.js";
import {GMULTX, GMULTY} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
import Animat from "./animation.js";
export default class Character extends GameObject {
  constructor(params) {
    super(params);
    this.underBricks = [];
    this.animatGroupsIndex = 0;
    this.animatGroups = [[]];
    this.tags.push("Character");
    this.speed = params.speed ?? 1;
    this.move = new Vect(params.isForward ?? true ? 1 : -1, 0);
    this._height = params.height ?? 2;
    this.checkCollision = true;
    for (let i = -1; i <= 1; i++) {
      this.animatGroupCurr.push(this.parent.pushGO(new Animat({
        ...params,
        isLoop: false,
        zModifier: i < 1 ? 301 : 29,
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
  get animImageIndex() {
    return this.move.x;
  }
  init() {
    this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
    this.setCurrentGroup();
  }
  update(dt) {
    if (this.isNormalMovment) {
      this.handleNormalMovement(dt);
      this.shift(true);
    } else {
      this.handleSpecialMovement(dt);
      this.shift(false);
    }
    if (this.checkCollision) {
      this.handleCollision();
      this.handleBricks();
      this.animatGroupCurr.forEach((s) => s.reset(this.gpos));
      this.checkCollision = false;
    }
  }
  shift(isCollideAfterShift) {
    var move = {
      x: Math.abs(this.spos.x) > GMULTX ? Math.sign(this.spos.x) : 0,
      y: Math.abs(this.spos.y) > GMULTY ? Math.sign(this.spos.y) : 0
    };
    if (move.x || move.y) {
      this.gpos.add(move);
      this.spos.sub({
        x: move.x * GMULTX,
        y: move.y * GMULTY
      });
      this.animatGroupCurr.forEach((a) => {
        a.gpos.add(move);
      });
      this.checkCollision = isCollideAfterShift;
      this.brickHandler.isRecheck = true;
    }
  }
  handleNormalMovement(dt) {
    this.spos.x += this.move.x * this.speed * GMULTX * dt;
  }
  handleSpecialMovement(dt) {
  }
  handleBricks(isClear = false) {
    this.underBricks.forEach((b) => b.pressure -= 1);
    if (isClear) {
      this.underBricks = [];
    } else {
      this.underBricks = this.brickHandler.checkCollisionRow(this.gpos.getAdd({x: -1, y: 1}), 2);
      this.underBricks.forEach((b) => b.pressure += 1);
    }
  }
  handleCollision() {
  }
  reverse() {
    this.move.x *= -1;
    this.gpos.x += this.move.x;
    this.animatGroups[0].forEach((x) => x.setImageIndex(this.animImageIndex));
  }
  setCurrentGroup(index) {
    index = index ?? this.animatGroupsIndex;
    this.animatGroupsIndex = index;
    this.animatGroups.forEach((sg, i) => sg.forEach((s) => {
      s.isActive = i == index;
      s.spos.setToZero();
      s.reset(this.gpos);
    }));
    this.animatGroupCurr.forEach((x) => x.setImageIndex(this.animImageIndex));
  }
  deactivate() {
    this.isActive = false;
    this.animatGroups.forEach((sg) => sg.forEach((s) => s.isActive = false));
    this.underBricks.forEach((b) => b.pressure -= 1);
    this.underBricks = [];
  }
}
//# sourceMappingURL=character.js.map
