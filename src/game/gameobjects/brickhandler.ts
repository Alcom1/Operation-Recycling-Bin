import GameObject from "engine/gameobjects/gameobject";
import {col1D, GMULTX, GMULTY, colBoundingBoxGrid, colPointRectGrid, colPointParHGrid, colPointParVGrid, OPPOSITE_DIRS, colRectRectCornerSize, MatchFactions, Faction} from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import Brick from "./bricknormal";
import CharacterHandler from "./characterhandler";
import Counter from "./counter";
import MobileIndicator from "./mobileindicator";

/** States for the brick handler's selection */
export enum BrickHandlerState {
    /** Empty */
    NONE,
    /** Indeterminate */
    INDY,
    /** Downward */
    DOWN,
    /** Upward */
    UP
}

/** A row of bricks */
interface BrickRow {
    /** Row (y) position */
    row: number;
    bricks: Brick[];
}

/** Handler for brick selection, movement, etc. */
export default class BrickHandler extends GameObject {

    /** */
    private counter!: Counter;

    /** All bricks */
    protected bricks: Brick[] = [];

    /** */
    private characterHandler : CharacterHandler | null = null;

    /** */
    private mobileIndicator : MobileIndicator | null = null;

    /** Current selected bricks */
    public selectedBrick: Brick | null = null;

    /** All selected bricks */
    private selections: (Brick[] | null)[] = [];

    /** Active bricks */
    private get bricksActive() { return this.bricks.filter(b => b.isActive && !b.isSelected); }

    /** Grey bricks */
    private get bricksGrey(): Brick[] { return this.bricks.filter(b => b.isActive && b.isGrey && !b.blockStrength); }

    /** Initalize the brick handler, get related bricks & game objects, manage bricks */
    public init(ctx: CanvasRenderingContext2D) {
        
        this.characterHandler = this.engine.tag.get(        // Get character handler from scene
            "CharacterHandler", 
            "LevelInterface")[0] as CharacterHandler;
        this.mobileIndicator = this.engine.tag.get(         // Get mobile indicator from scene
            "MobileIndicator", 
            "LevelInterface")[0] as MobileIndicator;
        this.counter = this.engine.tag.get(                 // Get counter from scene
            "Counter", 
            "LevelInterface")[0] as Counter;       
        this.bricks = this.engine.tag.get(                  // Get bricks from scene
            "Brick", 
            "Level") as Brick[];

        // Check for and log overlapping bricks
        this.bricks.forEach((b1, j) => {

            for(let i = j + 1; i < this.bricks.length; i++) {
                let b2 = this.bricks[i];

                // If this brick overlaps with the previous, log it.
                if (b1.gpos.y == b2.gpos.y && col1D(
                    b1.gpos.x, b1.gpos.x + b1.width, 
                    b2.gpos.x, b2.gpos.x + b2.width)) {
                    console.log(`OVERLAPPING BRICK AT {"x" : ${b1.gpos.x}, "y" : ${b1.gpos.y}}`);
                }
            }
        })

        // For each brick, do a recursive check in each direction.
        // If both directions are blocked, it's static.
        for (const b of this.bricks) {

            // Recurse in both directions. If both results are null, set brick to static
            b.isStatic = (OPPOSITE_DIRS).reduce<boolean>((a, c) => a && !this.recurseBrick(b, [c], true), true);

            // Clear recursion states after each recursive static check
            this.bricks.forEach(b => b.clearRecursion());
        }

        this.cullBrickStuds();  // Initial stud culling
    }

    /** Check selection placement, return true if this is a valid position */
    public checkSelectionPlacement(): boolean {

        const adjacents = [];       // Adjacency states, contains if we're attaching in the indexed direction.

        const min : Point = {x : Number.MAX_VALUE, y : Number.MAX_VALUE}
        const max : Point = {x : 0, y : 0}

        let noPlaceZones = this.characterHandler?.getNoPlaceZones();

        let isBlocked = false;  // If the selection is blocked by a blocking brick

        brickLoop : for (const brick1 of this.bricks.filter(b => b.isSelected)) {
            
            brick1.setToCursor();   // Force update so the brick position matches this frame and not the previous

            // Combine grid positions and sub positions for true positions
            let tposx = brick1.gpos.x + Math.round(brick1.spos.x / GMULTX);
            let tposy = brick1.gpos.y + Math.round(brick1.spos.y / GMULTY);

            // Do not place bricks in no-place zones (gliding bricks/characters are handled by this, instead)
            if (noPlaceZones?.some(p => 
                p.y == tposy &&
                p.x >= tposx &&
                p.x <  tposx + brick1.width)) {

                return false;
            }

            // Store minimum and maximum positions for a bounding box
            min.x = Math.min(min.x, tposx);
            min.y = Math.min(min.y, tposy);
            max.x = Math.max(max.x, tposx + brick1.width);
            max.y = Math.max(max.y, tposy + 1);

            // Check collision between current selected brick and every brick in its potential new row.
            for (const brick2 of this.bricksActive.filter(b => !b.isGlide && b.gpos.y == tposy)) { // For each non-gliding brick in the current row
                
                if (!brick2.isSelected && col1D(        // If the brick-in-row is colliding with this brick
                    tposx, tposx + brick1.width,
                    brick2.gpos.x, brick2.gpos.x + brick2.width)) {
                        
                    return false;                       // Fail for any collision
                }
            }

            // Check collision between current selected brick and every brick in its potential adjacent rows.
            for (let dir of OPPOSITE_DIRS) {            // For each direction

                // If row in the direction (above/below) has bricks, check each brick
                // For each brick in the row in that direction
                for (let brick2 of this.bricksActive.filter(b => !b.isGlide && b.gpos.y == tposy + dir)) {
                    
                    if (!brick2.isSelected && col1D(    // If the brick-in-row is colliding with this brick
                        tposx, tposx + brick1.width,
                        brick2.gpos.x, brick2.gpos.x + brick2.width)) {

                        if(!brick2.blockStrength) {
                            adjacents[dir] = true;      // Set adjacency state for this direction.
                        }
                        
                        // There is a blocking brick, set state and break out of the loop
                        if (brick2.blockStrength == 2) {
                            isBlocked = true;
                            break brickLoop;
                        }
                    }
                }
            }
        }

        // Selection is blocked, return false
        if(isBlocked) {
            return false;
        }

        // LEVEL BOUNDARY CHECK - Check if this brick is inside the boundary
        if (colBoundingBoxGrid(min, max)) {
            return false;       // Fail if outside boundary
        }

        // We need to attach in one direction but not both. Return true if we are attaching in a single direction.
        // If adjacency states are different, return true
        return adjacents[-1] != adjacents[1];
    }

    /** Check collisons for a vertically-looping range and return a bitmask */
    public checkCollisionRange(
        pos: Point, 
        dir: number, 
        start: number, 
        final: number, 
        height: number, 
        width: number = 2,
        faction: Faction = Faction.NEUTRAL): number {

        let collisions = 0; // Collision bitbask

        for(let i = start; i < final; i++) {

            let y = i % height;                     // Wrap by height
            let x = Math.floor(i / height) % width; // Wrap by width to go back and check ceiling

            for (const brick of this.bricksActive.filter(
                b => b.gpos.y == pos.y + y + 1 && 
                MatchFactions(b.faction, faction))) {

                if (col1D(
                    brick.gpos.x - 1, 
                    brick.gpos.x + brick.width, 
                    pos.x + x * dir,
                    pos.x + x * dir
                )) {
                    collisions += 1 << (i - start);
                }
            }
        }

        return collisions;
    }

    /** Check collisons for a square ring and return a bitmask */
    public checkCollisionRing(
        pos: Point, 
        size: number, 
        dir : number = 1, 
        overhang : boolean = true,
        faction: Faction = Faction.NEUTRAL) : number {

        let collisions = 0; // Collision bitbask
        let count = 0;      // Count gridspaces being checked
        let row : Brick[] = [];

        // Vertical travel
        for(let j = pos.y; j < pos.y + size; j++) {

            // Get this row
            row = this.bricksActive.filter(
                b => b.gpos.y == j && 
                !b.isSelected &&
                MatchFactions(b.faction, faction));

            // Horizontal travel, skip to end unless this is the first or last row to create a ring shape
            for(let i = pos.x; i < pos.x + size; i += ((j > pos.y && j < pos.y + size - 1) ? size - 1 : 1)) {

                // Reverse horizontally if the direction isn't positive.
                let check = dir > 0 ? i : 2 * pos.x - i + size - 1;

                // Check each brick int his row.
                row.forEach(brick => {

                    if (col1D(
                        brick.gpos.x - 1, 
                        brick.gpos.x + brick.width,
                        check,
                        check
                    )) {
                        collisions += 1 << (count);
                    }
                });

                count++;
            }
        }

        // Single overhang space
        if(overhang) {

            // x-pos of new space
            let check = dir > 0 ? pos.x + size : pos.x - 1;

            // Check each brick int his row.
            row.forEach(brick => {

                if (col1D(
                    brick.gpos.x - 1, 
                    brick.gpos.x + brick.width,
                    check,
                    check
                )) {
                    collisions += 1 << (count);
                }
            });

            count++;
        }

        return collisions;
    }

    /** Check collisions for a row and return the colliding bricks */
    public checkCollisionRow(pos: Vect, width: number): Brick[] {

        let bricks : Brick[] = [];

        for (const brick of this.bricks.filter(b => b.gpos.y == pos.y && !b.isSelected) || []) {

            if (col1D(
                brick.gpos.x, 
                brick.gpos.x + brick.width, 
                pos.x,
                pos.x + width
            )) {

                bricks.push(brick);
            }
        }

        return bricks;
    }

    /** Disable studs that are covered */
    public cullBrickStuds(): void {

        this.bricks.filter(b => !b.isSelected && b.hasTag("BrickNormal")).forEach(b1 => {

            // Hide studs based on above row
            b1.hideStuds(this.bricks.filter(b2 => b2.gpos.y == b1.gpos.y - 1 && b2.hasTag("BrickNormal")))
        });

        // Always show studs for selected bricks
        this.bricks.filter(b => b.isSelected && b.hasTag("BrickNormal")).forEach(b => b.showStuds());
    }

    /** Set the minimum and maximum position for selected bricks */
    public setSelectedMinMax(spos: Vect): void {
        const selected = this.bricks.filter(b => b.isSelected);

        // Minimum brick position among selected bricks
        const boundaryMin = new Vect(
            Math.min(...selected.map(b => b.gpos.x)),
            Math.min(...selected.map(b => b.gpos.y))
        );
        
        // Maximum brick position among selected bricks
        const boundaryMax = new Vect(
            Math.max(...selected.map(b => b.gpos.x + b.width)), // Width included for proper boundary
            Math.max(...selected.map(b => b.gpos.y + 1))        // Height included for proper boundary
        );

        // Set min-max for all selected bricks based on boundary
        selected.forEach(b => b.setMinMax(boundaryMin, boundaryMax));
        this.mobileIndicator?.setMinMax(boundaryMin, boundaryMax);
    }

    /** Set snapped state of selected bricks */
    public setSnappedBricks(state: boolean): void {

        // For each selected brick, set its snap to the given state
        this.bricks.filter(b => b.isSelected).forEach(b => b.snap(state));
        this.mobileIndicator?.snap(state);
    }

    /** Deselect all bricks */
    public deselectBricks(): void {

        this.selectedBrick = null;
        this.selections = [];
        this.bricks.forEach(b => b.deselect());

        // Disable mobile indicator
        this.mobileIndicator!.isActive = false;
    }

    /** Check all bricks for hover, return hover state */
    public hoverBricks(pos: Vect): BrickHandlerState {

        // Check all bricks and return if the first successful check is not static
        return this.checkBricks(pos, (b, p) => this.hoverBrick(b, p)) || BrickHandlerState.NONE;
    }

    /** Check all bricks for a mouse position and return the result of a function against that brick and position */
    private checkBricks<T>(pos: Vect, func: (brick: Brick, pos: Vect) => T): T | null {

        // Front face check
        for (const brick of this.bricksActive) {

            // Front face - if position is over this face
            if (colPointRectGrid(
                pos.x,
                pos.y,
                brick.gpos.x,
                brick.gpos.y,
                brick.width
            )) {
                return func(brick, pos);
            }
        }

        // Top and side face check
        for (let brick of this.bricksActive) {
            if (// Top Face - if position is over this face
                colPointParHGrid(
                    pos.x,
                    pos.y,
                    brick.gpos.x,
                    brick.gpos.y,
                    brick.width
                ) ||
                // Side Face - if position is over this face
                colPointParVGrid(
                    pos.x,
                    pos.y,
                    brick.gpos.x,
                    brick.gpos.y,
                    brick.width
                )) {

                return func(brick, pos);
            }
        }

        // There is no brick under this position.
        return null;    
    }

    /** Press a single brick */
    private hoverBrick(brick: Brick, pos: Vect): BrickHandlerState {

        this.selectedBrick = brick; // Set current selected brick for later use
        this.selections = [];       // Reset selections

        // Dp not proceed if the currently selected brick is blocked
        if(this.checkBrickIsBlocked(this.selectedBrick)) {

            return BrickHandlerState.NONE;
        }

        // Check both directions if they're valid (valid == not null)
        for (const dir of OPPOSITE_DIRS) {

            let selectionNew = this.recurseBrick(brick, [dir], true) ?? [];

            // If there are bricks to select
            if (selectionNew!.length > 0) {

                // Add floating bricks to selection
                selectionNew = selectionNew.concat(this.getFloatingBricks());

                // Validate that none of the selected bricks are blocked
                let isAnyBlocked = selectionNew.some(b => this.checkBrickIsBlocked(b));

                // Add floating bricks to direction's selection
                this.selections[dir] = !isAnyBlocked ? selectionNew : null;
            }

            // Clear recursion states after each recursive direction check
            this.bricksActive.forEach(b => b.clearRecursion());
        }

        return this.selections[-1] && 
            this.selections[1]  ? BrickHandlerState.INDY :  // If both selections are valid, return indeterminate state
            this.selections[-1] ? BrickHandlerState.UP :    // If upward selection is valid, return up state
            this.selections[1]  ? BrickHandlerState.DOWN :  // If downward selection is valid, return down state
            BrickHandlerState.NONE;                         // No direction is valid. Return no state
    }

    /** Check if a single brick is being blocked by a character */
    private checkBrickIsBlocked(brick : Brick) : boolean {

        // Row above for brick being evaluated
        for (const brick2 of this.bricksActive.filter(b => b.gpos.y == brick.gpos.y - 1)) {

            if (brick2.blockStrength > 0 &&   // If a brick in the other row is blocking
                col1D(              // And it overlaps with the current brick
                    brick.gpos.x, brick.gpos.x + brick.width, 
                    brick2.gpos.x, brick2.gpos.x + brick2.width)) {
                
                return true;        // Return true
            }
        }

        return false;
    }

    /** Return floating bricks after a selection */
    private getFloatingBricks(): Brick[] {
        
        let ret : Brick[] = [];

        // Recursively check from all grey bricks and mark connected bricks as grounded
        for (const brick of this.bricksGrey) {

            // If the grey brick isn't checked (Reduces redundancy)
            if (!brick.isChecked) {
                this.recurseBrick(brick, OPPOSITE_DIRS, false)?.forEach(c => c.isGrounded = true);
            }
        }

        // Select active floating bricks and clear recursion states
        // Stop trying to move the selected check! You know why it's there! (I've forgotten why it's there.)
        for (const brick of this.bricksActive) {

            // If the brick isn't grounded or selected, it's floating! Add it.
            if (!brick.isGrounded && !brick.isSelected && !brick.blockStrength) {
                ret.push(brick);
            }

            // Clear stored recursive results in brick
            brick.clearRecursion();
        }

        return ret;
    }

    /** 
     * Check all bricks for press, return press state (none, processed, indeterminate)
     * This entire function is bananas.
    */
    public pressBricks(pos: Vect): boolean {

        // Build an array of selections that are not null (invalid)
        // Filter to remove null (invalid) selections
        const validSelections = OPPOSITE_DIRS.map(d => this.selections[d]).filter(s => s);

        // If there is a single valid selection, use and auto-process it
        if (validSelections.length == 1) {
            // Process this selection using bricks in truthy direction, and the position.
            return this.processSelection(validSelections[0], pos);
        }

        // For the indeterminate state, just press the currently selected brick
        if (this.selectedBrick) {
            this.selectedBrick.press();
        }

        // Return falsy for indeterminate state
        return false;
    }

    /** Set bricks to selected based on a provided cursor position */
    public initSelection(pos: Vect, dir: -1 | 1) {
        
        return this.processSelection(this.selections[dir], pos);
    }
    
    /** 
     * Process a selection, set all its bricks to a selected state,
     * search for floating bricks, return if bricks were selected
    */
    private processSelection(selection: Brick[] | null, pos: Vect) {

        // Select bricks
        selection?.forEach(b => b.select(pos));

        this.mobileIndicator!.cursorPosition = pos;

        this.counter.incrementCount();

        return !!selection;
    }

    /** Recursively select bricks. */
    private recurseBrick(brick1: Brick, dirs: (-1 | 1)[], checkGrey: boolean) {

        // Return nothing for grey bricks
        if (checkGrey && brick1.isGrey) {
            return null;
        }

        brick1.isChecked = true;

        // Current brick is a new brick in the selection
        let selection = [brick1];

        // Recursion should not progress past blocking bricks
        if (brick1.blockStrength) {
            return selection;
        }

        // For all directions, check adjacent bricks in that direction and recurse for each brick
        for (const dir of dirs) {

            // If adjacent row in the direction (above/below) has bricks, check and recurse for each brick
            // Also, skip blocking bricks, so characters do not interfere (Does this break something?)
            for (const brick2 of this.bricksActive.filter(b => !b.blockStrength && b.gpos.y == brick1.gpos.y + dir)) {

                if (!brick2.isChecked && col1D(
                    brick1.gpos.x, brick1.gpos.x + brick1.width, 
                    brick2.gpos.x, brick2.gpos.x + brick2.width)) {
                    
                    // Recursively check the new brick and add the results to the current selection
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