import GameObject from "../../engine/gameobjects/gameobject.js";
import {col1D, GMULTX, GMULTY, colBoundingBoxGrid, colPointRectGrid, colPointParHGrid, colPointParVGrid, OPPOSITE_DIRS, colRectRectCornerSize} from "../../engine/utilities/math.js";
import Vect from "../../engine/utilities/vect.js";
export var BrickHandlerState;
(function(BrickHandlerState2) {
  BrickHandlerState2[BrickHandlerState2["NONE"] = 0] = "NONE";
  BrickHandlerState2[BrickHandlerState2["INDY"] = 1] = "INDY";
  BrickHandlerState2[BrickHandlerState2["DOWN"] = 2] = "DOWN";
  BrickHandlerState2[BrickHandlerState2["UP"] = 3] = "UP";
  BrickHandlerState2[BrickHandlerState2["SAME"] = 4] = "SAME";
})(BrickHandlerState || (BrickHandlerState = {}));
export default class BrickHandler extends GameObject {
  constructor() {
    super(...arguments);
    this.rows = [];
    this.bricks = [];
    this.mobileIndicator = null;
    this.selectedBrick = null;
    this.selections = [];
    this.isRecheck = false;
  }
  get bricksGrey() {
    return this.bricks.filter((b) => b.isGrey == true);
  }
  init(ctx) {
    this.mobileIndicator = this.engine.tag.get("MobileIndicator", "LevelInterface")[0];
    this.counter = this.engine.tag.get("Counter", "LevelInterface")[0];
    this.bricks = this.engine.tag.get("Brick", "Level");
    this.bricks.forEach((b) => this.addBrickToRows(b));
    this.sortRows();
    this.rows.forEach((r) => r.bricks.forEach((b1, i) => {
      var b2 = r.bricks[i - 1];
      if (i > 0 && col1D(b1.gpos.x, b1.gpos.x + b1.width, b2.gpos.x, b2.gpos.x + b2.width)) {
        console.log(`OVERLAPPING BRICK AT {"x" : ${b1.gpos.x}, "y" : ${r.row}}`);
      }
    }));
    for (const b of this.bricks) {
      b.isStatic = OPPOSITE_DIRS.reduce((a, c) => a && !this.recurseBrick(b, [c], true), true);
      this.bricks.forEach((b2) => b2.clearRecursion());
    }
    this.cullBrickStuds();
  }
  checkPressureSelection(dir) {
    return this.selections[dir]?.every((x) => x.pressure <= 0) ?? false;
  }
  checkCollisionSelection() {
    const adjacents = [];
    const min = {x: Number.MAX_VALUE, y: Number.MAX_VALUE};
    const max = {x: 0, y: 0};
    const bricksSelected = this.bricks.filter((b) => b.isSelected);
    for (const brick1 of bricksSelected) {
      brick1.setToCursor();
      var tposx = brick1.gpos.x + Math.round(brick1.spos.x / GMULTX);
      var tposy = brick1.gpos.y + Math.round(brick1.spos.y / GMULTY);
      min.x = Math.min(min.x, tposx);
      min.y = Math.min(min.y, tposy);
      max.x = Math.max(max.x, tposx + brick1.width);
      max.y = Math.max(max.y, tposy + 1);
      for (const brick22 of this.rows.find((r) => r.row == tposy)?.bricks || []) {
        if (!brick22.isSelected && col1D(tposx, tposx + brick1.width, brick22.gpos.x, brick22.gpos.x + brick22.width)) {
          return false;
        }
      }
      for (var dir of OPPOSITE_DIRS) {
        for (var brick2 of this.rows.find((r) => r.row == tposy + dir)?.bricks || []) {
          if (!brick2.isSelected && col1D(tposx, tposx + brick1.width, brick2.gpos.x, brick2.gpos.x + brick2.width)) {
            adjacents[dir] = true;
            break;
          }
        }
      }
    }
    if (colBoundingBoxGrid(min, max)) {
      return false;
    }
    for (const c of this.engine.collision.collidePassive(min, max)) {
      for (const b of bricksSelected) {
        if (colRectRectCornerSize(c.min, c.max, b.gpos.getAdd({
          x: Math.round(b.spos.x / GMULTX),
          y: Math.round(b.spos.y / GMULTY)
        }), {x: b.width, y: 1})) {
          return false;
        }
      }
    }
    return adjacents[-1] != adjacents[1];
  }
  checkCollisionRange(pos, dir, start, final, height, width = 2) {
    let collisions = 0;
    for (let i = start; i < final; i++) {
      let y = i % height;
      let x = Math.floor(i / height) % width;
      for (const brick of this.rows.find((r) => r.row == pos.y + y + 1)?.bricks.filter((b) => !b.isSelected) || []) {
        if (col1D(brick.gpos.x - 1, brick.gpos.x + brick.width, pos.x + x * dir, pos.x + x * dir)) {
          collisions += 1 << i - start;
        }
      }
    }
    return collisions;
  }
  checkCollisionRow(pos, width) {
    let bricks = [];
    for (const brick of this.rows.find((r) => r.row == pos.y)?.bricks.filter((b) => !b.isSelected) || []) {
      if (col1D(brick.gpos.x, brick.gpos.x + brick.width, pos.x, pos.x + width)) {
        bricks.push(brick);
      }
    }
    return bricks;
  }
  cullBrickStuds() {
    this.bricks.filter((b) => !b.isSelected && b.hasTag("BrickNormal")).forEach((b) => {
      b.hideStuds(this.rows.find((r) => r.row == b.gpos.y - 1)?.bricks.filter((b2) => b2.hasTag("BrickNormal")) || []);
    });
    this.bricks.filter((b) => b.isSelected && b.hasTag("BrickNormal")).forEach((b) => b.showStuds());
  }
  setSelectedMinMax(spos) {
    const selected = this.bricks.filter((b) => b.isSelected);
    const boundaryMin = new Vect(Math.min(...selected.map((b) => b.gpos.x)), Math.min(...selected.map((b) => b.gpos.y)));
    const boundaryMax = new Vect(Math.max(...selected.map((b) => b.gpos.x + b.width)), Math.max(...selected.map((b) => b.gpos.y + 1)));
    selected.forEach((b) => b.setMinMax(boundaryMin, boundaryMax));
    this.mobileIndicator?.setMinMax(boundaryMin, boundaryMax);
  }
  setSnappedBricks(state) {
    this.bricks.filter((b) => b.isSelected).forEach((b) => b.snap(state));
    this.mobileIndicator?.snap(state);
  }
  deselectBricks() {
    this.selectedBrick = null;
    this.selections = [];
    this.bricks.forEach((b) => b.deselect());
    this.rows.forEach((r) => {
      var move = r.bricks.filter((b) => b.gpos.y != r.row);
      r.bricks = r.bricks.filter((b) => b.gpos.y == r.row);
      move.forEach((b) => this.addBrickToRows(b));
    });
    this.sortRows();
    this.mobileIndicator.isActive = false;
  }
  addBrickToRows(brick) {
    const currRow = this.rows.find((r) => r.row == brick.gpos.y);
    if (currRow == null) {
      this.rows.push({
        row: brick.gpos.y,
        bricks: [brick]
      });
    } else {
      currRow.bricks.push(brick);
    }
  }
  sortRows() {
    this.rows.sort((a, b) => a.row > b.row ? 1 : 0);
    this.rows.forEach((r) => r.bricks.sort((a, b) => a.gpos.x > b.gpos.x ? 1 : 0));
  }
  hoverBricks(pos) {
    return this.checkBricks(pos, (b, p) => this.hoverBrick(b, p)) || 0;
  }
  checkBricks(pos, func) {
    for (const brick2 of this.bricks) {
      if (colPointRectGrid(pos.x, pos.y, brick2.gpos.x, brick2.gpos.y, brick2.width)) {
        return func(brick2, pos);
      }
    }
    for (var brick of this.bricks) {
      if (colPointParHGrid(pos.x, pos.y, brick.gpos.x, brick.gpos.y, brick.width) || colPointParVGrid(pos.x, pos.y, brick.gpos.x, brick.gpos.y, brick.width)) {
        return func(brick, pos);
      }
    }
    return null;
  }
  hoverBrick(brick, pos) {
    if (this.selectedBrick != null && this.selectedBrick.compare(brick) && !this.isRecheck) {
      return 4;
    }
    this.isRecheck = false;
    this.selectedBrick = brick;
    this.selections = [];
    for (const dir of OPPOSITE_DIRS) {
      let selectionNew = this.recurseBrick(brick, [dir], true) ?? [];
      if (selectionNew.length > 0) {
        let floats = this.getFloatingBricks();
        if (floats.every((b) => b.pressure == 0)) {
          this.selections[dir] = selectionNew.concat(floats);
        }
      }
      this.bricks.forEach((b) => b.clearRecursion());
    }
    return this.selections[-1] && this.selections[1] ? 1 : this.selections[-1] ? 3 : this.selections[1] ? 2 : 0;
  }
  getFloatingBricks() {
    var ret = [];
    for (const brick of this.bricksGrey) {
      if (!brick.isChecked) {
        this.recurseBrick(brick, OPPOSITE_DIRS, false)?.forEach((c) => c.isGrounded = true);
      }
    }
    for (const brick of this.bricks) {
      if (!brick.isGrounded && !brick.isSelected) {
        ret.push(brick);
      }
      brick.clearRecursion();
    }
    return ret;
  }
  pressBricks(pos) {
    const validSelections = OPPOSITE_DIRS.map((d) => this.selections[d]).filter((s) => s);
    if (validSelections.length == 1) {
      return this.processSelection(validSelections[0], pos);
    }
    if (this.selectedBrick) {
      this.selectedBrick.press();
    }
    return false;
  }
  initSelection(pos, dir) {
    return this.processSelection(this.selections[dir], pos);
  }
  processSelection(selection, pos) {
    selection?.forEach((b) => b.select(pos));
    this.mobileIndicator.cursorPosition = pos;
    this.counter.incrementCount();
    return !!selection;
  }
  recurseBrick(brick1, dirs, checkGrey) {
    if (checkGrey && (brick1.isGrey || brick1.pressure > 0)) {
      return null;
    }
    brick1.isChecked = true;
    let selection = [brick1];
    for (const dir of dirs) {
      for (const brick2 of this.rows.find((r) => r.row == brick1.gpos.y + dir)?.bricks || []) {
        if (!brick2.isChecked && col1D(brick1.gpos.x, brick1.gpos.x + brick1.width, brick2.gpos.x, brick2.gpos.x + brick2.width)) {
          const result = this.recurseBrick(brick2, dirs, checkGrey);
          if (result) {
            selection = selection.concat(result);
          } else {
            return null;
          }
        }
      }
    }
    return selection;
  }
}
//# sourceMappingURL=brickhandler.js.map
