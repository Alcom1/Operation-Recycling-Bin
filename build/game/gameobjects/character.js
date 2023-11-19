import GameObject from "../../engine/gameobjects/gameobject.js";
import {Faction, GMULTX, GMULTY} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
import Anim from "./anim.js";
import BrickPhantom from "./brickphantom.js";
export default class Character extends GameObject {
  constructor(params) {
    super(params);
    this.animations = [];
    this.stateIndex = 0;
    this.bricks = [];
    this._faction = this.faction == Faction.FRIENDLY ? Faction.FRIENDLY : Faction.HOSTILE;
    this.tags.push("Character");
    this._speed = params.speed ?? 1;
    this._move = new Vect(params.isForward ?? true ? 1 : -1, 0);
    this._height = params.height ?? 2;
    this.isGlide = params.isGlide ?? false;
    this.stateAnimations = [0, ...params.stateAnimations ?? (params.animsMisc ? params.animsMisc.map((x, i) => i + 1) : [])];
    this.animations.push(new Anim({
      ...params,
      ...params.animMain,
      speed: this.isGlide ? 6 : params.speed,
      isLoop: this.isGlide,
      framesSize: GMULTX * 6,
      gposOffset: {x: -3, y: 0}
    }));
    params.animsMisc?.forEach((m) => {
      this.animations.push(new Anim({
        ...params,
        speed: null,
        ...m
      }));
    });
    this.animations.forEach((a) => this.parent.pushGO(a));
    for (let i = 0; i < this.height; i++) {
      this.bricks.push(this.parent.pushGO(new BrickPhantom({
        ...params,
        faction: this.faction,
        glide: this.isGlide,
        width: 2,
        position: this.gpos.getAdd({x: -1, y: -i})
      })));
    }
  }
  get height() {
    return this._height;
  }
  get move() {
    return this._move;
  }
  get speed() {
    return this._speed;
  }
  get animationsCurr() {
    return this.animations[this.stateAnimations[this.stateIndex]];
  }
  get isNormalMovment() {
    return this.stateIndex == 0;
  }
  get animationSubindex() {
    return this.move.x;
  }
  get zIndex() {
    return super.zIndex;
  }
  set zIndex(value) {
    super.zIndex = value;
    this.animations.forEach((s) => s.zIndex = value);
  }
  get zpos() {
    return this.gpos.getAdd({
      x: -1,
      y: 1 - this.height + (this.spos.y < 0 ? -1 : 0)
    });
  }
  get zSize() {
    return {
      x: 2 + (this.isGlide && this.stateIndex == 0 && this.move.y == 0 && this.move.x == 1 ? 1 : 0),
      y: this.height + (this.spos.y != 0 ? 1 : 0)
    };
  }
  init() {
    this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
    this.setStateIndex();
  }
  update(dt) {
    if (this.isNormalMovment) {
      if (this.isGlide) {
        if (this.move.y == 0) {
          this.spos.x += this.move.x * this._speed * GMULTX * dt;
        } else {
          this.spos.y += this.move.y * this._speed * GMULTY * dt;
        }
      }
    } else {
      this.handleSpecialMovement(dt);
    }
    if (this.isGlide) {
      this.animationsCurr.spos = this.spos;
    }
  }
  handleSpecialMovement(dt) {
  }
  reverse() {
    this._move.x *= -1;
    this.animations[0].setImageIndex(this.animationSubindex);
    this.animationsCurr.reset();
    if (this.isGlide) {
      this.animationsCurr.reset(this.gpos);
    }
  }
  moveAll(offset, isAnimReset = true) {
    this.gpos.add(offset);
    this.bricks.forEach((b, i) => {
      b.gpos = this.gpos.getAdd({x: -1, y: -i});
    });
    if (isAnimReset) {
      this.setStateIndex();
    }
  }
  setStateIndex(index) {
    this.stateIndex = index ?? this.stateIndex;
    this.animations.forEach((s, i) => {
      s.isActive = i == this.stateAnimations[this.stateIndex];
      s.spos.setToZero();
      s.reset(this.gpos);
    });
    this.animationsCurr.setImageIndex(this.animationSubindex);
  }
  handleStep() {
  }
  handleStepUpdate(proxs) {
  }
  getNoPlaceZone() {
    return [];
  }
  deactivate() {
    this.isActive = false;
    this.animations.forEach((s) => s.isActive = false);
    this.bricks.forEach((b) => b.isActive = false);
  }
}
//# sourceMappingURL=character.js.map
