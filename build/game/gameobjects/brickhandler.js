import GameObject from "../../engine/gameobjects/gameobject.js";
import {colBorderBoxGrid, col1D, GMULTX, GMULTY, colPointRectGrid, colPointParHGrid, colPointParVGrid, OPPOSITE_DIRS} from "../../engine/utilities/math.js";
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
    this.selectedBrick = null;
    this.selections = [];
  }
  get bricksGrey() {
    return this.bricks.filter((b) => b.isGrey == true);
  }
  init(ctx) {
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
  checkSelectionCollision() {
    const adjacents = [];
    for (const brick1 of this.bricks.filter((b) => b.isSelected)) {
      brick1.setToCursor();
      var tposx = brick1.gpos.x + Math.round(brick1.spos.x / GMULTX);
      var tposy = brick1.gpos.y + Math.round(brick1.spos.y / GMULTY);
      if (colBorderBoxGrid(tposx, tposy, brick1.width)) {
        return false;
      }
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
    return adjacents[-1] != adjacents[1];
  }
  checkSelectionCollisionHorz(pos, height) {
    for (let y = pos.y; y > pos.y - height; y--) {
      for (const brick2 of this.rows.find((r) => r.row == y)?.bricks.filter((b) => !b.isSelected) || []) {
        if (col1D(brick2.gpos.x - 1, brick2.gpos.x + brick2.width, pos.x, pos.x)) {
          return true;
        }
      }
    }
    return false;
  }
  cullBrickStuds() {
    for (const stud of this.bricks.filter((b) => !b.isSelected).flatMap((b) => b.studs)) {
      stud.isVisible = true;
      for (const brick2 of this.rows.find((r) => r.row == stud.gpos.y)?.bricks || []) {
        if (!brick2.isSelected && !brick2.isPressed && col1D(brick2.gpos.x - 1, brick2.gpos.x + brick2.width, stud.gpos.x, stud.gpos.x)) {
          stud.isVisible = false;
          break;
        }
      }
    }
    this.bricks.filter((b) => b.isSelected).flatMap((b) => b.studs).forEach((s) => s.isVisible = true);
  }
  setSelectedMinMax() {
    const selected = this.bricks.filter((b) => b.isSelected);
    const boundaryMin = new Vect(Math.min(...selected.map((b) => b.gpos.x)), Math.min(...selected.map((b) => b.gpos.y)));
    const boundaryMax = new Vect(Math.max(...selected.map((b) => b.gpos.x + b.width)), Math.max(...selected.map((b) => b.gpos.y + 1)));
    selected.forEach((b) => b.setMinMax(boundaryMin, boundaryMax));
  }
  setSnappedBricks(state) {
    this.bricks.filter((b) => b.isSelected).forEach((b) => b.snap(state));
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
  }
  addBrickToRows(brick2) {
    const currRow = this.rows.find((r) => r.row == brick2.gpos.y);
    if (currRow == null) {
      this.rows.push({
        row: brick2.gpos.y,
        bricks: [brick2]
      });
    } else {
      currRow.bricks.push(brick2);
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
    for (const brick3 of this.bricks) {
      if (colPointRectGrid(pos.x, pos.y, brick3.gpos.x, brick3.gpos.y, brick3.width)) {
        return func(brick3, pos);
      }
    }
    for (var brick2 of this.bricks) {
      if (colPointParHGrid(pos.x, pos.y, brick2.gpos.x, brick2.gpos.y, brick2.width) || colPointParVGrid(pos.x, pos.y, brick2.gpos.x, brick2.gpos.y, brick2.width)) {
        return func(brick2, pos);
      }
    }
    return null;
  }
  hoverBrick(brick2, pos) {
    if (this.selectedBrick != null && this.selectedBrick.compare(brick2)) {
      return 4;
    }
    this.selectedBrick = brick2;
    this.selections = [];
    for (const dir of OPPOSITE_DIRS) {
      this.selections[dir] = this.recurseBrick(brick2, [dir], true);
    }
    this.bricks.forEach((b) => b.clearRecursion());
    return this.selections[-1] && this.selections[1] ? 1 : this.selections[-1] ? 3 : this.selections[1] ? 2 : 0;
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
    if (selection != null) {
      for (const brick2 of this.bricksGrey) {
        if (!brick2.isChecked) {
          this.recurseBrick(brick2, OPPOSITE_DIRS, false)?.forEach((c) => c.isGrounded = true);
        }
      }
      for (const brick2 of this.bricks) {
        if (!brick2.isGrounded && !brick2.isSelected) {
          brick2.select(pos);
        }
        brick2.clearRecursion();
      }
    }
    return !!selection;
  }
  recurseBrick(brick1, dirs, checkGrey) {
    if (checkGrey && brick1.isGrey) {
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
