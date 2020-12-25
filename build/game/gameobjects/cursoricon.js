import GameObject from "../../engine/gameobjects/gameobject.js";
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
    this.cursorURLs = {
      [0]: this.engine.baker.bake((ctx) => this.drawCursorBase(ctx), 32, 32, "CURSOR.NONE"),
      [1]: this.engine.baker.bake((ctx) => {
        this.drawCursorBase(ctx);
        this.drawDecalArrowDouble(ctx);
      }, 32, 32, "CURSOR.DRAG"),
      [2]: this.engine.baker.bake((ctx) => {
        this.drawCursorBase(ctx);
        this.drawDecalArrowQuad(ctx);
      }, 32, 32, "CURSOR.CARRY"),
      [3]: this.engine.baker.bake((ctx) => {
        this.drawCursorBase(ctx);
        this.drawDecalArrowDouble(ctx);
      }, 32, 32, "CURSOR.INDY"),
      [4]: this.engine.baker.bake((ctx) => {
        this.drawCursorBase(ctx);
        this.drawDecalArrowDown(ctx);
      }, 32, 32, "CURSOR.DOWN"),
      [5]: this.engine.baker.bake((ctx) => {
        this.drawCursorBase(ctx);
        this.drawDecalArrowUp(ctx);
      }, 32, 32, "CURSOR.UP")
    };
    this.setCursor(0);
  }
  setCursor(state) {
    this.engine.mouse.setCursorURL(this.cursorURLs[state]);
  }
  drawCursorBase(ctx) {
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(1, 1);
    ctx.lineTo(1, 11);
    ctx.lineTo(11, 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  drawDecalArrowDouble(ctx) {
    ctx.fillStyle = "#444";
    ctx.translate(16, 16);
    ctx.beginPath();
    for (var i = 0; i < 2; i++) {
      ctx.lineTo(5, 3);
      ctx.lineTo(0, 9);
      ctx.lineTo(-5, 3);
      ctx.lineTo(-2, 3);
      ctx.lineTo(-2, -3);
      ctx.rotate(Math.PI);
    }
    ctx.closePath();
    ctx.fill();
  }
  drawDecalArrowDown(ctx) {
    ctx.translate(16, 17);
    this.drawDecalArrow(ctx);
  }
  drawDecalArrowUp(ctx) {
    ctx.translate(16, 15);
    ctx.rotate(Math.PI);
    this.drawDecalArrow(ctx);
  }
  drawDecalArrow(ctx) {
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.lineTo(5, 0);
    ctx.lineTo(0, 7);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-2, -8);
    ctx.lineTo(2, -8);
    ctx.lineTo(2, 0);
    ctx.closePath();
    ctx.fill();
  }
  drawDecalArrowQuad(ctx) {
    ctx.translate(16, 16);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "#333";
    ctx.fillRect(-6, -6, 12, 12);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "#FFF";
    ctx.fillRect(-4.5, -4.5, 9, 9);
  }
}
//# sourceMappingURL=cursoricon.js.map
