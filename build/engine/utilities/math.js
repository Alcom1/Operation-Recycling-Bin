export const PATH_IMG = "assets/img/";
export const GMULTX = 30;
export const GMULTY = 36;
export const UNDER_CURSOR_Z_INDEX = 100;
export const Z_DEPTH = 22;
export const WIDTH_SIDEPANEL = 234;
export const OPPOSITE_DIRS = [-1, 1];
export const BOUNDARY = Object.freeze({
  minx: 0,
  miny: 2,
  maxx: 35,
  maxy: 24
});
export function pathImg(fileName, extension) {
  return `${PATH_IMG}${fileName}.${extension ?? "png"}`;
}
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
export function round(val, target) {
  return Math.round(val / target) * target;
}
export function bitStack(numbers) {
  var ret = 0;
  numbers.forEach((n) => ret += 1 << n);
  return ret;
}
export function colBoundingBoxGrid(min, max) {
  return min.x < BOUNDARY.minx || min.y < BOUNDARY.miny || max.x >= BOUNDARY.maxx + 1 || max.y >= BOUNDARY.maxy + 1;
}
export function colPointRect(px, py, rx, ry, rw, rh) {
  return px >= rx && py >= ry && px < rx + rw && py < ry + rh;
}
export function colRectRectCorner(aminx, amaxx, aminy, amaxy, brx, bry, brw, brh) {
  return colRectRectCorners(aminx, amaxx, aminy, amaxy, brx, brx + brw, bry, bry + brh);
}
export function colRectRectCorners(aminx, amaxx, aminy, amaxy, bminx, bmaxx, bminy, bmaxy) {
  return aminx < bmaxx && amaxx > bminx && aminy < bmaxy && amaxy > bminy;
}
export function colPointRectGrid(px, py, rx, ry, rw) {
  return colPointRect(px, py, rx * GMULTX, ry * GMULTY, rw * GMULTX, GMULTY);
}
export function colPointParH(px, py, rx, ry, rw, rh) {
  return px >= rx - py + ry && py >= ry && px < rx + rw - py + ry && py < ry + rh;
}
export function colPointParHGrid(px, py, rx, ry, rw) {
  return colPointParH(px, py, rx * GMULTX + Z_DEPTH, ry * GMULTY - Z_DEPTH, rw * GMULTX, Z_DEPTH);
}
export function colPointParV(px, py, rx, ry, rw, rh) {
  return px >= rx && py >= ry - px + rx && px < rx + rw && py < ry + rh - px + rx;
}
export function colPointParVGrid(px, py, rx, ry, rw) {
  return colPointParV(px, py, rx * GMULTX + rw * GMULTX, ry * GMULTY, Z_DEPTH, GMULTY);
}
export function col1D(a1, a2, b1, b2) {
  return a2 > b1 && a1 < b2;
}
export function getZIndex(gpos, modifier = 0) {
  return gpos.x * 10 - gpos.y * 100 + modifier;
}
export function colorTranslate(color) {
  switch (color) {
    case void 0:
      return "#999999";
    case "white":
      return "#EEEEEE";
    case "blue":
      return "#0033FF";
    case "yellow":
      return "#FFCC00";
    case "red":
      return "#CC0000";
    case "black":
      return "#333344";
    case "grey":
      return "#808080";
    case "green":
      return "#008000";
    default:
      if (color.startsWith("#"))
        return color;
      else
        throw new Error(`No color definition available for color '${color}'`);
  }
}
export function colorMult(color, value) {
  return colorChange(color, value, (c, v) => c * v);
}
export function colorAdd(color, value) {
  return colorChange(color, value, (c, v) => c + v);
}
export function colorChange(color, value, func) {
  let channels = [];
  for (let i = 0; i < 3; i++) {
    channels[i] = parseInt(color.substr(2 * i + 1, 2), 16);
  }
  channels = channels.map((c) => clamp(Math.round(func(c, value)), 0, 255));
  channels = channels.map((c) => ("0" + c.toString(16)).substr(-2));
  return "#" + channels.join("");
}
//# sourceMappingURL=math.js.map
