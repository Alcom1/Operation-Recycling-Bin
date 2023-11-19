import GameObject from "../../engine/gameobjects/gameobject.js";
import {col1D, GMULTX, GMULTY, colBoundingBoxGrid, colPointRectGrid, colPointParHGrid, colPointParVGrid, OPPOSITE_DIRS, MatchFactions, Faction} from "../../engine/utilities/math.js";
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
    this.bricks = [];
    this.characterHandler = null;
    this.mobileIndicator = null;
    this.selectedBrick = null;
    this.selections = [];
  }
  get bricksActive() {
    return this.bricks.filter((b) => b.isActive && !b.isSelected);
  }
  get bricksGrey() {
    return this.bricks.filter((b) => b.isActive && b.isGrey && !b.isBlock);
  }
  init(ctx) {
    this.characterHandler = this.engine.tag.get("CharacterHandler", "LevelInterface")[0];
    this.mobileIndicator = this.engine.tag.get("MobileIndicator", "LevelInterface")[0];
    this.counter = this.engine.tag.get("Counter", "LevelInterface")[0];
    this.bricks = this.engine.tag.get("Brick", "Level");
    this.bricks.forEach((b1, j) => {
      for (let i = j + 1; i < this.bricks.length; i++) {
        let b2 = this.bricks[i];
        if (b1.gpos.y == b2.gpos.y && col1D(b1.gpos.x, b1.gpos.x + b1.width, b2.gpos.x, b2.gpos.x + b2.width)) {
          console.log(`OVERLAPPING BRICK AT {"x" : ${b1.gpos.x}, "y" : ${b1.gpos.y}}`);
        }
      }
    });
    for (const b of this.bricks) {
      b.isStatic = OPPOSITE_DIRS.reduce((a, c) => a && !this.recurseBrick(b, [c], true), true);
      this.bricks.forEach((b2) => b2.clearRecursion());
    }
    this.cullBrickStuds();
  }
  checkCollisionSelection() {
    const adjacents = [];
    const min = {x: Number.MAX_VALUE, y: Number.MAX_VALUE};
    const max = {x: 0, y: 0};
    let noPlaceZones = this.characterHandler?.getNoPlaceZones();
    let isBlocked = false;
    brickLoop:
      for (const brick1 of this.bricks.filter((b) => b.isSelected)) {
        brick1.setToCursor();
        var tposx = brick1.gpos.x + Math.round(brick1.spos.x / GMULTX);
        var tposy = brick1.gpos.y + Math.round(brick1.spos.y / GMULTY);
        if (noPlaceZones?.some((p) => p.y == tposy && p.x >= tposx && p.x < tposx + brick1.width)) {
          return false;
        }
        min.x = Math.min(min.x, tposx);
        min.y = Math.min(min.y, tposy);
        max.x = Math.max(max.x, tposx + brick1.width);
        max.y = Math.max(max.y, tposy + 1);
        for (const brick22 of this.bricksActive.filter((b) => !b.isGlide && b.gpos.y == tposy)) {
          if (!brick22.isSelected && col1D(tposx, tposx + brick1.width, brick22.gpos.x, brick22.gpos.x + brick22.width)) {
            return false;
          }
        }
        for (var dir of OPPOSITE_DIRS) {
          for (var brick2 of this.bricksActive.filter((b) => !b.isGlide && b.gpos.y == tposy + dir)) {
            if (!brick2.isSelected && col1D(tposx, tposx + brick1.width, brick2.gpos.x, brick2.gpos.x + brick2.width)) {
              adjacents[dir] = true;
              if (brick2.isBlock) {
                isBlocked = true;
                break brickLoop;
              }
            }
          }
        }
      }
    if (isBlocked) {
      return false;
    }
    if (colBoundingBoxGrid(min, max)) {
      return false;
    }
    return adjacents[-1] != adjacents[1];
  }
  checkCollisionRange(pos, dir, start, final, height, width = 2, faction = Faction.NEUTRAL) {
    let collisions = 0;
    for (let i = start; i < final; i++) {
      let y = i % height;
      let x = Math.floor(i / height) % width;
      for (const brick of this.bricksActive.filter((b) => b.gpos.y == pos.y + y + 1 && MatchFactions(b.faction, faction))) {
        if (col1D(brick.gpos.x - 1, brick.gpos.x + brick.width, pos.x + x * dir, pos.x + x * dir)) {
          collisions += 1 << i - start;
        }
      }
    }
    return collisions;
  }
  checkCollisionRing(pos, size, dir = 1, overhang = true) {
    let collisions = 0;
    let count = 0;
    let row = [];
    for (let j = pos.y; j < pos.y + size; j++) {
      row = this.bricksActive.filter((b) => b.gpos.y == j && !b.isSelected);
      for (let i = pos.x; i < pos.x + size; i += j > pos.y && j < pos.y + size - 1 ? size - 1 : 1) {
        let check = dir > 0 ? i : 2 * pos.x - i + size - 1;
        row.forEach((brick) => {
          if (col1D(brick.gpos.x - 1, brick.gpos.x + brick.width, check, check)) {
            collisions += 1 << count;
          }
        });
        count++;
      }
    }
    if (overhang) {
      let check = dir > 0 ? pos.x + size : pos.x - 1;
      row.forEach((brick) => {
        if (col1D(brick.gpos.x - 1, brick.gpos.x + brick.width, check, check)) {
          collisions += 1 << count;
        }
      });
      count++;
    }
    return collisions;
  }
  checkCollisionRow(pos, width) {
    let bricks = [];
    for (const brick of this.bricks.filter((b) => b.gpos.y == pos.y && !b.isSelected) || []) {
      if (col1D(brick.gpos.x, brick.gpos.x + brick.width, pos.x, pos.x + width)) {
        bricks.push(brick);
      }
    }
    return bricks;
  }
  cullBrickStuds() {
    this.bricks.filter((b) => !b.isSelected && b.hasTag("BrickNormal")).forEach((b1) => {
      b1.hideStuds(this.bricks.filter((b2) => b2.gpos.y == b1.gpos.y - 1 && b2.hasTag("BrickNormal")));
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
    this.mobileIndicator.isActive = false;
  }
  hoverBricks(pos) {
    return this.checkBricks(pos, (b, p) => this.hoverBrick(b, p)) || 0;
  }
  checkBricks(pos, func) {
    for (const brick2 of this.bricksActive) {
      if (colPointRectGrid(pos.x, pos.y, brick2.gpos.x, brick2.gpos.y, brick2.width)) {
        return func(brick2, pos);
      }
    }
    for (var brick of this.bricksActive) {
      if (colPointParHGrid(pos.x, pos.y, brick.gpos.x, brick.gpos.y, brick.width) || colPointParVGrid(pos.x, pos.y, brick.gpos.x, brick.gpos.y, brick.width)) {
        return func(brick, pos);
      }
    }
    return null;
  }
  hoverBrick(brick, pos) {
    this.selectedBrick = brick;
    this.selections = [];
    if (this.checkBrickIsBlocked(this.selectedBrick)) {
      return 0;
    }
    for (const dir of OPPOSITE_DIRS) {
      let selectionNew = this.recurseBrick(brick, [dir], true) ?? [];
      if (selectionNew.length > 0) {
        selectionNew = selectionNew.concat(this.getFloatingBricks());
        let isAnyBlocked = selectionNew.some((b) => this.checkBrickIsBlocked(b));
        this.selections[dir] = !isAnyBlocked ? selectionNew : null;
      }
      this.bricksActive.forEach((b) => b.clearRecursion());
    }
    return this.selections[-1] && this.selections[1] ? 1 : this.selections[-1] ? 3 : this.selections[1] ? 2 : 0;
  }
  checkBrickIsBlocked(brick) {
    for (const brick2 of this.bricksActive.filter((b) => b.gpos.y == brick.gpos.y - 1)) {
      if (brick2.isBlock && col1D(brick.gpos.x, brick.gpos.x + brick.width, brick2.gpos.x, brick2.gpos.x + brick2.width)) {
        return true;
      }
    }
    return false;
  }
  getFloatingBricks() {
    var ret = [];
    for (const brick of this.bricksGrey) {
      if (!brick.isChecked) {
        this.recurseBrick(brick, OPPOSITE_DIRS, false)?.forEach((c) => c.isGrounded = true);
      }
    }
    for (const brick of this.bricksActive) {
      if (!brick.isGrounded && !brick.isSelected && !brick.isBlock) {
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
    if (checkGrey && brick1.isGrey) {
      return null;
    }
    brick1.isChecked = true;
    let selection = [brick1];
    if (brick1.isBlock) {
      return selection;
    }
    for (const dir of dirs) {
      for (const brick2 of this.bricksActive.filter((b) => !b.isBlock && b.gpos.y == brick1.gpos.y + dir)) {
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
