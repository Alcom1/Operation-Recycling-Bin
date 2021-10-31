import GameObject from "../../engine/gameobjects/gameobject.js";
export default class ZGameObject extends GameObject {
  constructor(params) {
    super(params);
    this.zIndex = params.zIndex || 0;
  }
  getGOZIndex() {
    return this.zIndex;
  }
}
//# sourceMappingURL=zgameobject.js.map
