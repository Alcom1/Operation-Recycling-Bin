import GameObject from "../../engine/gameobjects/gameobject.js";
import {getZIndex} from "../../engine/utilities/math.js";
export default class ZGameObject extends GameObject {
  constructor(params) {
    super(params);
    this.zIndex = params.zIndex || 0;
  }
  getGOZIndex() {
    return this.zIndex;
  }
  setZIndex(modifier) {
    this.zIndex = getZIndex(this.gpos, modifier);
  }
}
//# sourceMappingURL=zgameobject.js.map
