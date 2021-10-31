import Vect from "../utilities/vect.js";
import {getZIndex} from "../utilities/math.js";
export default class GameObject {
  constructor(params) {
    this.isActive = true;
    this.gpos = new Vect(params.position?.x ?? 0, params.position?.y ?? 0);
    this.spos = new Vect(params.subPosition?.x ?? 0, params.subPosition?.y ?? 0);
    this.tags = params.tags ?? [params.name];
    this.parent = params.scene;
    this.engine = params.engine;
  }
  init(ctx) {
  }
  compare(gameObject) {
    return gameObject.gpos.x == this.gpos.x && gameObject.gpos.y == this.gpos.y;
  }
  hasTag(tag) {
    return this.tags.some((t) => t === tag);
  }
  getColliders() {
    return [];
  }
  getGOZIndex() {
    return getZIndex(this.gpos);
  }
  resolveCollision(mask) {
  }
  update(dt) {
  }
  draw(ctx) {
  }
  superDraw(ctx) {
  }
}
//# sourceMappingURL=gameobject.js.map
