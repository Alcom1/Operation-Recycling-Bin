import Vect from "../utilities/vect.js";
import {Faction} from "../utilities/math.js";
export default class GameObject {
  constructor(params) {
    this._id = crypto.randomUUID();
    this.collisions = [];
    this.gpos = new Vect(params.position?.x ?? 0, params.position?.y ?? 0);
    this.spos = new Vect(params.subPosition?.x ?? 0, params.subPosition?.y ?? 0);
    this.tags = params.tags ?? [params.name];
    this.parent = params.scene;
    this.engine = params.engine;
    this._faction = params.faction ?? Faction.NEUTRAL;
    this.isActive = params.isActive ?? true;
    this.isDebug = params.isDebug ?? false;
    this._zIndex = params.zIndex ?? 0;
    this._zNoCompare = params.zNoCompare ?? false;
  }
  get id() {
    return this._id;
  }
  get faction() {
    return this._faction;
  }
  get zIndex() {
    return this._zIndex;
  }
  get zNoCompare() {
    return this._zNoCompare;
  }
  set zIndex(value) {
    this._zIndex = value;
  }
  get zpos() {
    return this.gpos;
  }
  get zState() {
    return this.isActive;
  }
  get zSize() {
    return {x: 1, y: 1};
  }
  get zLayer() {
    return 0;
  }
  init(ctx) {
  }
  compare(gameObject) {
    return gameObject.gpos.x == this.gpos.x && gameObject.gpos.y == this.gpos.y;
  }
  hasTag(tag) {
    return this.tags.some((t) => t === tag);
  }
  updateSync(counter, loopLength) {
  }
  update(dt) {
  }
  draw(ctx) {
  }
  superDraw(ctx) {
  }
  getColliders() {
    return [];
  }
  setCollision(mask, other) {
    this.collisions.push({
      mask,
      other
    });
  }
  resolveClearCollisions() {
    this.resolveCollisions(this.collisions);
    this.collisions = [];
  }
  resolveCollisions(collisions) {
    collisions.forEach((c) => this.resolveCollision(c.mask, c.other));
  }
  resolveCollision(mask, other) {
  }
}
//# sourceMappingURL=gameobject.js.map
