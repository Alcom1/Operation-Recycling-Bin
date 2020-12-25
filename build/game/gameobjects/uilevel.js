import GameObject from "../../engine/gameobjects/gameobject.js";
import {BOUNDARY, colorAdd, colorMult, colorTranslate, GMULTX, GMULTY, LINE_WIDTH, Z_DEPTH} from "../../engine/utilities/math.js";
export default class UILevel extends GameObject {
  constructor(engine2, params) {
    super(engine2, params);
    this.logoColor = "#747474";
    this.image = new Image();
    this.color = colorTranslate();
    this.colorDark = colorMult(this.color, 0.625);
    this.colorBright = colorAdd(this.color, 48);
    this.colorCeiling = colorTranslate("black");
    this.colorCeilingDark = colorMult(this.colorCeiling, 0.625);
    this.colorCeilingBright = colorAdd(this.colorCeiling, 48);
    this.image.src = this.engine.baker.bake((ctx) => this.drawBackground(ctx));
  }
  draw(ctx) {
    ctx.drawImage(this.image, 0, 0);
  }
  drawBackground(ctx) {
    ctx.save();
    this.drawSidebar(ctx);
    ctx.restore();
    ctx.save();
    this.drawCeiling(ctx);
    ctx.restore();
    ctx.save();
    this.drawLogo(ctx);
    ctx.restore();
  }
  drawSidebar(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.fillRect(GMULTX * BOUNDARY.maxx + Z_DEPTH / 2, GMULTY, ctx.canvas.width - GMULTX * BOUNDARY.maxx, ctx.canvas.height - GMULTY);
    ctx.translate(GMULTX * BOUNDARY.maxx, GMULTY * (BOUNDARY.maxy - 1));
    ctx.fillRect(0, 0, GMULTX * 9, GMULTY);
    ctx.fillStyle = this.colorBright;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Z_DEPTH / 2, -Z_DEPTH / 2);
    ctx.lineTo(ctx.canvas.width, -Z_DEPTH);
    ctx.lineTo(ctx.canvas.width, 0);
    ctx.fill();
    ctx.strokeStyle = this.colorBright;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = "square";
    ctx.strokeStyle = this.colorBright;
    ctx.beginPath();
    ctx.moveTo(LINE_WIDTH * 1.5, GMULTY / 3);
    ctx.lineTo(ctx.canvas.width, GMULTY / 3);
    ctx.stroke();
    ctx.strokeStyle = this.colorDark;
    ctx.beginPath();
    ctx.moveTo(LINE_WIDTH, GMULTY / 3 - LINE_WIDTH / 2);
    ctx.lineTo(LINE_WIDTH * 1.5, GMULTY / 3 - LINE_WIDTH);
    ctx.lineTo(ctx.canvas.width, GMULTY / 3 - LINE_WIDTH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(Z_DEPTH / 2, -GMULTY * (BOUNDARY.maxy - 3) - Z_DEPTH / 2);
    ctx.lineTo(Z_DEPTH / 2, -Z_DEPTH / 2);
    ctx.lineTo(LINE_WIDTH / 2, 0);
    ctx.lineTo(LINE_WIDTH / 2, GMULTY - LINE_WIDTH / 2);
    ctx.lineTo(ctx.canvas.width, GMULTY - LINE_WIDTH / 2);
    ctx.stroke();
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(Z_DEPTH / 2, -Z_DEPTH / 2);
    ctx.lineTo(LINE_WIDTH / 2, 0);
    ctx.stroke();
  }
  drawCeiling(ctx) {
    var ceilOffsetU = GMULTY / 3 * 4;
    var ceilOffsetL = GMULTY / 3 * 5;
    var ceilOffsetB = ceilOffsetU - Z_DEPTH;
    ctx.fillStyle = this.colorCeiling;
    ctx.fillRect(0, ceilOffsetU, ctx.canvas.width, ceilOffsetL - ceilOffsetU);
    ctx.fillStyle = this.colorCeilingBright;
    ctx.beginPath();
    ctx.moveTo(0, ceilOffsetU);
    ctx.lineTo(Z_DEPTH, ceilOffsetB);
    ctx.lineTo(ctx.canvas.width, ceilOffsetB);
    ctx.lineTo(ctx.canvas.width, ceilOffsetU);
    ctx.fill();
    ctx.strokeStyle = this.colorCeilingDark;
    ctx.beginPath();
    ctx.moveTo(0, ceilOffsetL);
    ctx.lineTo(ctx.canvas.width, ceilOffsetL);
    ctx.stroke();
    for (let i = LINE_WIDTH / 2; i < ctx.canvas.width; ) {
      ctx.strokeStyle = this.colorCeiling;
      ctx.beginPath();
      ctx.moveTo(i + Z_DEPTH - LINE_WIDTH, ceilOffsetB + LINE_WIDTH);
      ctx.lineTo(i, ceilOffsetU);
      ctx.stroke();
      ctx.strokeStyle = this.colorCeilingDark;
      ctx.beginPath();
      ctx.moveTo(i, ceilOffsetU + LINE_WIDTH / 2);
      ctx.lineTo(i, ceilOffsetL);
      ctx.stroke();
      i += 4 * GMULTX;
    }
    ctx.strokeStyle = this.colorCeiling;
    ctx.beginPath();
    ctx.moveTo(Z_DEPTH, ceilOffsetB + LINE_WIDTH / 2);
    ctx.lineTo(ctx.canvas.width, ceilOffsetB + LINE_WIDTH / 2);
    ctx.stroke();
  }
  drawLogo(ctx) {
    ctx.translate(ctx.canvas.width / 2 + BOUNDARY.maxx * GMULTX / 2 + Z_DEPTH / 4, 175);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = this.logoColor;
      var logoStart = 10;
      var logoWidth = 64;
      var logoThick = 17;
      var logoPoint = 28;
      ctx.beginPath();
      ctx.moveTo(logoStart, logoWidth - logoThick);
      ctx.lineTo(logoWidth - logoThick, logoWidth - logoThick);
      ctx.lineTo(logoWidth - logoThick, logoPoint);
      ctx.lineTo(logoWidth / 2, logoPoint);
      ctx.lineTo(logoWidth, -logoStart / 2);
      ctx.lineTo(logoWidth / 2 * 3, logoPoint);
      ctx.lineTo(logoWidth + logoThick, logoPoint);
      ctx.lineTo(logoWidth + logoThick, logoWidth + logoThick);
      ctx.lineTo(logoStart, logoWidth + logoThick);
      ctx.fill();
      ctx.rotate(Math.PI / 2);
    }
  }
}
//# sourceMappingURL=uilevel.js.map
