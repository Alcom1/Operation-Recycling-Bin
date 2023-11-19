import GameObject from "../../engine/gameobjects/gameobject.js";
import {BOUNDARY, col1D, gap1D, GMULTX, GMULTY} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
export default class ZIndexHandler extends GameObject {
  constructor() {
    super(...arguments);
    this.zPoints = [];
    this.zEdges = [];
    this.debug = false;
  }
  get zPointsActive() {
    return this.zPoints.filter((z) => z.state);
  }
  init() {
    this.engine.tag.get(["Brick", "Character", "Stud", "Wind", "Misc"], "Level").filter((x) => {
      return x.tags.every((x2) => x2 != "BrickPhantom");
    }).forEach((o) => this.zPoints.push({
      gameObject: o,
      pos: this.getTrueZpos(o.zpos, o.zSize.y == 0),
      size: this.getTrueZsize(o.zSize),
      flat: o.zSize.y == 0,
      state: o.zState,
      layer: o.zLayer,
      noCompare: o.zNoCompare
    }));
    this.processZPoints();
  }
  update() {
    this.processZPoints();
  }
  processZPoints() {
    this.zEdges = [];
    this.zPoints.forEach((z) => {
      z.pos = this.getTrueZpos(z.gameObject.zpos, z.flat);
      z.state = z.gameObject.zState;
      z.layer = z.gameObject.zLayer;
      z.size = this.getTrueZsize(z.gameObject.zSize);
    });
    this.zEdges = this.zPointsActive.flatMap((z) => this.processZPoint(z).map((b) => [z, b]));
    this.topologicalSort().forEach((z, i) => {
      z.gameObject.zIndex = i;
    });
  }
  getTrueZpos(zpos, flat) {
    return new Vect(zpos.x, zpos.y * 2 - (flat ? 0 : 1));
  }
  getTrueZsize(zsize) {
    return new Vect(zsize.x, Math.max(zsize.y * 2, 1));
  }
  processZPoint(c) {
    let ret = [];
    ret = ret.concat(this.zPointsActive.filter((o) => {
      if (!this.checkValidComparison(c, o)) {
        return false;
      }
      let isAbove = c.pos.y > o.pos.y;
      let isAlign = col1D(c.pos.x, c.pos.x + c.size.x, o.pos.x, o.pos.x + o.size.x);
      let distance = gap1D(o.pos.y, o.pos.y + o.size.y, c.pos.y, c.pos.y + c.size.y);
      return isAbove && isAlign && distance <= 1;
    }));
    ret = ret.concat(this.zPointsActive.filter((o) => {
      if (!this.checkValidComparison(c, o)) {
        return false;
      }
      let isAhead = c.pos.x < o.pos.x;
      let isAlign = col1D(c.pos.y, c.pos.y + c.size.y, o.pos.y, o.pos.y + o.size.y);
      let distance = gap1D(c.pos.x, c.pos.x + c.size.x, o.pos.x, o.pos.x + o.size.x);
      return isAhead && isAlign && distance <= 1 && !(o.flat && distance < 0);
    }));
    return ret;
  }
  checkValidComparison(a, b) {
    if (a === b) {
      return false;
    }
    if (a.noCompare && b.noCompare) {
      return false;
    }
    if (a.layer != b.layer) {
      return false;
    }
    return true;
  }
  superDraw(ctx) {
    if (!this.debug) {
      return;
    }
    ctx.save();
    ctx.translate(1 * GMULTX, 2 * GMULTY);
    let scale = 10;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, BOUNDARY.maxx * scale, BOUNDARY.maxy * scale * 2);
    ctx.globalAlpha = 0.75;
    this.zPointsActive.forEach((p) => {
      let border = p.size.y > 2 ? 3 : 1;
      ctx.fillStyle = p.flat ? "#38F" : p.size.y > 2 ? "#F33" : "#FF3";
      ctx.fillRect(scale * p.pos.x + border, scale * p.pos.y + border, scale * p.size.x - border * 2, scale * p.size.y - border * 2);
    });
    ctx.restore();
  }
  topologicalSort() {
    const sorted = [];
    const starts = [];
    const leads = new Map(this.zPoints.map((z) => [z, this.zEdges.filter((e) => e[1] === z).length]));
    leads.forEach((q, p) => {
      if (q === 0) {
        starts.push(p);
      }
    });
    while (starts.length > 0) {
      let curr = starts.shift();
      sorted.push(curr);
      this.zEdges.filter((e) => e[0] === curr).forEach((e) => {
        leads.set(e[1], leads.get(e[1]) - 1);
        if (leads.get(e[1]) == 0) {
          starts.push(e[1]);
        }
      });
    }
    if (sorted.length != this.zPoints.length) {
      console.log(`WARNING, LOOP in Z-SORTING, Sorted : ${sorted.length}, Expected : ${this.zPoints.length}}`);
    }
    return sorted;
  }
}
//# sourceMappingURL=zindexhandler.js.map
