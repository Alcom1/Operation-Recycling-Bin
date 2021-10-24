import GameObject from "../../engine/gameobjects/gameobject.js";
import {MouseState} from "../../engine/modules/mouse.js";
import Vect from "../../engine/utilities/vect.js";
import {BrickHandlerState} from "./brickhandler.js";
import {CursorIconState} from "./cursoricon.js";
var CursorState;
(function(CursorState2) {
  CursorState2[CursorState2["NONE"] = 0] = "NONE";
  CursorState2[CursorState2["DRAG"] = 1] = "DRAG";
  CursorState2[CursorState2["CARRY"] = 2] = "CARRY";
  CursorState2[CursorState2["HOVER"] = 3] = "HOVER";
})(CursorState || (CursorState = {}));
export default class Cursor extends GameObject {
  constructor() {
    super(...arguments);
    this.ppos = new Vect(0, 0);
    this.pLength = 10;
    this.state = 0;
    this.hoverState = BrickHandlerState.NONE;
    this.snapState = false;
    this.isUpdateForced = false;
  }
  init(ctx, scenes) {
    const level = scenes.find((s) => s.name == "Level");
    if (!level)
      throw new Error("Can't find level");
    this.level = level;
    const brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
    if (!brickHandler)
      throw new Error("Can't find BrickHandler");
    this.brickHandler = brickHandler;
    const cursorIcon = this.engine.tag.get("CursorIcon", "LevelInterface")[0];
    if (!cursorIcon)
      throw new Error("Can't find CursorIcon");
    this.cursorIcon = cursorIcon;
  }
  update(dt) {
    var tempSpos = this.engine.mouse.getPos();
    if (this.isUpdateForced || tempSpos.getDiff(this.spos) || this.brickHandler.isPressured) {
      this.isUpdateForced = false;
      switch (this.state) {
        case 0:
        case 3:
          this.hoverBricks(tempSpos);
          break;
        case 1:
          const diff = this.spos.y - this.ppos.y;
          const dir = Math.sign(diff);
          if (Math.abs(diff) > this.pLength && this.brickHandler.checkPressureSelection(dir)) {
            this.selectBricks(dir);
          }
          break;
        case 2:
          this.snapState = this.brickHandler.checkCollisionSelection();
          this.brickHandler.setSnappedBricks(this.snapState);
          break;
      }
    }
    this.spos = tempSpos;
    switch (this.engine.mouse.getMouseState()) {
      case MouseState.WASPRESSED:
        if (this.state == 0) {
          this.hoverBricks(this.spos);
        } else if (this.state == 3) {
          if (this.brickHandler.pressBricks(this.spos)) {
            this.carry();
          } else {
            this.ppos = this.spos;
            this.drag();
          }
        }
        break;
      case MouseState.WASRELEASED:
        if (this.state != 2 || this.snapState) {
          this.brickHandler.deselectBricks();
          if (this.snapState) {
            this.brickHandler.cullBrickStuds();
          }
          this.isUpdateForced = true;
          this.resetState();
        }
        break;
    }
  }
  hoverBricks(pos) {
    const hoverState = this.brickHandler.hoverBricks(pos);
    switch (hoverState) {
      case BrickHandlerState.NONE:
        this.resetState();
        break;
      case BrickHandlerState.SAME:
        break;
      default:
        this.hover(hoverState);
        break;
    }
  }
  selectBricks(dir) {
    if (this.brickHandler.initSelection(this.ppos, dir)) {
      this.carry();
    }
  }
  resetState() {
    if (this.state != 0) {
      this.cursorIcon.setCursor(CursorIconState.NONE);
      this.brickHandler.selectedBrick = null;
      this.state = 0;
    }
  }
  hover(hoverState) {
    if (this.state != 3 || this.hoverState != hoverState) {
      switch (hoverState) {
        case BrickHandlerState.INDY:
          this.cursorIcon.setCursor(CursorIconState.HOVER);
          break;
        case BrickHandlerState.UP:
          this.cursorIcon.setCursor(CursorIconState.HOVERUP);
          break;
        case BrickHandlerState.DOWN:
          this.cursorIcon.setCursor(CursorIconState.HOVERDOWN);
          break;
      }
      this.state = 3;
      this.hoverState = hoverState;
    }
  }
  drag() {
    if (this.state != 1) {
      this.cursorIcon.setCursor(CursorIconState.DRAG);
      this.brickHandler.cullBrickStuds();
      this.state = 1;
    }
  }
  carry() {
    if (this.state != 2) {
      this.cursorIcon.setCursor(CursorIconState.CARRY);
      this.brickHandler.cullBrickStuds();
      this.brickHandler.setSnappedBricks(true);
      this.brickHandler.setSelectedMinMax(this.spos);
      this.state = 2;
    }
  }
}
//# sourceMappingURL=cursor.js.map
