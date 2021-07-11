import GameObject from "../../engine/gameobjects/gameobject.js";
import {MouseState} from "../../engine/modules/mouse.js";
import {colorAdd, colorMult, colorTranslate, colPointRect, Z_DEPTH, WIDTH_SIDEPANEL} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
export default class Button extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.press = false;
    this.hover = false;
    this.images = new Map([[false, new Map()], [true, new Map()]]);
    this.bgColor = colorTranslate(params.backgroundColor ?? "#DDDDDD");
    this.bgColorDark = colorMult(this.bgColor, 0.75);
    this.bgColorBright = colorAdd(this.bgColor, 48);
    this.bhColor = colorTranslate(params.hoverColor || "#DDDD00");
    this.bhColorDark = colorMult(this.bhColor, 0.75);
    this.bhColorBright = colorAdd(this.bhColor, 48);
    this.size = new Vect(params.size?.x ?? 0, params.size?.y ?? 0);
    this.depth = params.depth || Z_DEPTH / 4;
    this.font = params.font ?? "16px FiveByFive";
    this.color = params.color ?? "#333333";
    this.text = params.text ?? "";
    this.isCenterUI = !!params.isCenterUI;
    for (const press of [false, true]) {
      for (const hover of [false, true]) {
        const img = new Image();
        img.src = this.engine.baker.bake((ctx) => this.drawButton(ctx, press, hover), this.size.x + this.depth, this.size.y + this.depth, `BUTTON.${this.text}.${press ? "PRESS" : "UNPRS"}.${hover ? "HOVER" : "OUTSD"}`);
        this.images.get(press)?.set(hover, img);
      }
    }
  }
  init(ctx, scenes) {
    if (this.isCenterUI) {
      this.spos.x = ctx.canvas.width - WIDTH_SIDEPANEL / 2;
    }
  }
  update(dt) {
    var pos = this.engine.mouse.getPos();
    this.hover = colPointRect(pos.x, pos.y, this.spos.x - this.size.x / 2, this.spos.y - this.size.y / 2, this.size.x + this.depth, this.size.y + this.depth);
    if (this.hover) {
      switch (this.engine.mouse.getMouseState()) {
        case MouseState.ISRELEASED:
          this.press = false;
          break;
        case MouseState.WASPRESSED:
          this.press = true;
          break;
        case MouseState.WASRELEASED:
          if (this.press) {
            this.doButtonAction();
            this.press = false;
          }
          break;
      }
    } else {
      if (this.press && this.engine.mouse.getMouseState() == MouseState.ISRELEASED) {
        this.press = false;
      }
    }
  }
  draw(ctx) {
    ctx.drawImage(this.images.get(this.press)?.get(this.hover), -this.size.x / 2, -this.size.y / 2);
  }
  doButtonAction() {
    console.log(this.text);
  }
  drawButton(ctx, press, hover) {
    var currentDepth = press ? this.depth / 2 : this.depth;
    ctx.translate(this.depth - currentDepth, currentDepth);
    ctx.fillStyle = hover ? this.bhColorBright : this.bgColorBright;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(currentDepth, -currentDepth);
    ctx.lineTo(this.size.x + currentDepth, -currentDepth);
    ctx.lineTo(this.size.x, 0);
    ctx.fill();
    ctx.fillStyle = hover ? this.bhColorDark : this.bgColorDark;
    ctx.beginPath();
    ctx.moveTo(this.size.x, 0);
    ctx.lineTo(this.size.x + currentDepth, -currentDepth);
    ctx.lineTo(this.size.x + currentDepth, this.size.y - currentDepth);
    ctx.lineTo(this.size.x, this.size.y);
    ctx.fill();
    ctx.fillStyle = hover ? this.bhColor : this.bgColor;
    ctx.fillRect(0, 0, this.size.x, this.size.y);
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, this.size.x / 2, this.size.y / 2 - 4);
  }
}
//# sourceMappingURL=button.js.map
