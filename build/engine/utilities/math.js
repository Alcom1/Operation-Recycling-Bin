import Vect from "./vect.js";
export const PATH_IMG = "assets/img/";
export const GMULTX = 30;
export const GMULTY = 36;
export const Z_DEPTH = 22;
export const WIDTH_SIDEPANEL = 234;
export const OPPOSITE_DIRS = [-1, 1];
export const MOBILE_PREVIEW_MAX = new Vect(6, 3);
export var Faction;
(function(Faction2) {
  Faction2[Faction2["FRIENDLY"] = 0] = "FRIENDLY";
  Faction2[Faction2["NEUTRAL"] = 1] = "NEUTRAL";
  Faction2[Faction2["HOSTILE"] = 2] = "HOSTILE";
})(Faction || (Faction = {}));
export function MatchFactions(a, b) {
  return Math.abs(b - a) < 2;
}
export const BOUNDARY = Object.freeze({
  minx: 0,
  miny: 2,
  maxx: 35,
  maxy: 24
});
export const MASKS = Object.freeze({
  block: 1,
  scrap: 2,
  death: 4,
  float: 8,
  super: 16,
  water: 32,
  jumps: 64,
  press: 128,
  enemy: 256
});
export const RING_BITSTACK = Object.freeze({
  flor: bitStack(9, 10),
  roof: bitStack(1, 2),
  face: bitStack(5, 7),
  back: bitStack(4, 6),
  land: bitStack(11),
  band: bitStack(8)
});
export const RING_BITSTACKB = Object.freeze({
  ...RING_BITSTACK,
  hang: RING_BITSTACK.land + bitStack(12)
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
export function floor(val, target) {
  return Math.floor(val / target) * target;
}
export function zip(val) {
  return val >= 0 ? OPPOSITE_DIRS[val % 2] * Math.ceil((val + 1) / 2) : 0;
}
export function bitStack(...numbers) {
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
export function colRectRectSizes(apos, adim, bpos, bdim) {
  return colRectRectCorners(apos, apos.getAdd(adim), bpos, bpos.getAdd(bdim));
}
export function colRectRectCornerSize(amin, amax, bpos, bdim) {
  return colRectRectCorners(amin, amax, bpos, bpos.getAdd(bdim));
}
export function colRectRectCorners(amin, amax, bmin, bmax) {
  return amin.x < bmax.x && amax.x > bmin.x && amin.y < bmax.y && amax.y > bmin.y;
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
export function gap1D(a1, a2, b1, b2) {
  if (a1 > a2) {
    [a1, a2] = [a2, a1];
  }
  ;
  if (b1 > b2) {
    [b1, b2] = [b2, b1];
  }
  ;
  return Math.abs(b1 - a2) < Math.abs(a1 - b2) ? b1 - a2 : a1 - b2;
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
