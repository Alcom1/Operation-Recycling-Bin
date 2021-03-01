import GameObject from "../../engine/gameobjects/gameobject.js";
import {pathImg} from "../../engine/utilities/math.js";
export var CursorIconState;
(function(CursorIconState2) {
  CursorIconState2[CursorIconState2["NONE"] = 0] = "NONE";
  CursorIconState2[CursorIconState2["DRAG"] = 1] = "DRAG";
  CursorIconState2[CursorIconState2["CARRY"] = 2] = "CARRY";
  CursorIconState2[CursorIconState2["HOVER"] = 3] = "HOVER";
  CursorIconState2[CursorIconState2["HOVERDOWN"] = 4] = "HOVERDOWN";
  CursorIconState2[CursorIconState2["HOVERUP"] = 5] = "HOVERUP";
})(CursorIconState || (CursorIconState = {}));
export default class CursorIcon extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.cursorImages = new Map([
      [0, "cursor_none"],
      [1, "cursor_drag"],
      [2, "cursor_carry"],
      [3, "cursor_drag"],
      [4, "cursor_down"],
      [5, "cursor_up"]
    ]);
    this.cursorImages.forEach((v, k) => this.cursorImages.set(k, pathImg(v)));
    this.setCursor(0);
  }
  setCursor(state) {
    this.engine.mouse.setCursorURL(this.cursorImages.get(state));
  }
}
//# sourceMappingURL=cursoricon.js.map
