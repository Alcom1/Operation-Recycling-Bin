import GameObject from "engine/gameobjects/gameobject";
import {col1D, GMULTX, GMULTY, colBoundingBoxGrid, colPointRectGrid, colPointParHGrid, colPointParVGrid, OPPOSITE_DIRS, colRectRectCornerSize} from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import Brick from "./brick";
import CharacterHandler from "./characterhandler";

export enum BrickHandlerState {
    /** Empty */
    NONE,
    /** Indeterminate */
    INDY,
    /** Downward */
    DOWN,
    /** Upward */
    UP,
    /** Unchanged */
    SAME
}

interface BrickRow {
    /** Row (y) position */
    row: number;
    bricks: Brick[];
}

export default class BrickHandler extends GameObject {

    /** */
    private characterHandler! : CharacterHandler;
    /** Rows of bricks */
    private rows: BrickRow[] = [];
    /** All bricks */
    private bricks: Brick[] = [];
    /** Current selected bricks */
    public selectedBrick: Brick | null = null;
    /** All selected bricks */
    private selections: (Brick[] | null)[] = [];
    /** Grey bricks */
    private get bricksGrey(): Brick[] { return this.bricks.filter(b => b.isGrey == true); }
    /** If a brick has been stepped on or off */
    public isPressured = true;

    public init(ctx: CanvasRenderingContext2D) {
        
        this.characterHandler = this.engine.tag.get(        // Get character handler from scene
            "CharacterHandler", 
            "LevelInterface")[0] as CharacterHandler;
        this.bricks = this.engine.tag.get(                  // Get bricks from scene
            "Brick", 
            "Level") as Brick[];                            
        this.bricks.forEach(b => this.addBrickToRows(b));   // Add bricks into rows
        this.sortRows();                                    // Sort rows/bricks within rows

        // Check for and log overlapping bricks
        this.rows.forEach(r => r.bricks.forEach((b1, i) => {
            
            var b2 = r.bricks[i - 1];

            // If this brick overlaps with the previous, log it.
            if(i > 0 && col1D(
                b1.gpos.x, b1.gpos.x + b1.width, 
                b2.gpos.x, b2.gpos.x + b2.width)) {
                console.log(`OVERLAPPING BRICK AT {"x" : ${b1.gpos.x}, "y" : ${r.row}}`);
            }
        }));

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

    /** Check selection pressure, return if any selected bricks have a pressure <= 0  */
    public checkPressureSelection(dir : -1 | 1) : boolean {
        return this.selections[dir]?.every(x => x.pressure <= 0) ?? false;
    }

    /** Check selection collision, return true if this is a valid position **/
    public checkCollisionSelection(): boolean {

        const adjacents = [];       // Adjacency states, contains if we're attaching in the indexed direction.

        const min : Point = {x : Number.MAX_VALUE, y : Number.MAX_VALUE}
        const max : Point = {x : 0, y : 0}

        for (const brick1 of this.bricks.filter(b => b.isSelected)) {
            
            brick1.setToCursor();   // Force update so the brick position matches this frame and not the previous

            // Combine grid positions and sub positions for true positions
            var tposx = brick1.gpos.x + Math.round(brick1.spos.x / GMULTX);
            var tposy = brick1.gpos.y + Math.round(brick1.spos.y / GMULTY);

            // Store minimum and maximum positions for a bounding box
            min.x = Math.min(min.x, tposx);
            min.y = Math.min(min.y, tposy);
            max.x = Math.max(max.x, tposx + brick1.width);
            max.y = Math.max(max.y, tposy + 1);

            // Check collision between current selected brick and every brick in its potential new row.
            for (const brick2 of this.rows.find(r => r.row == tposy)?.bricks || []) { // For each brick in the current row
                
                if (!brick2.isSelected && col1D(        // If the brick-in-row is colliding with this brick
                    tposx, tposx + brick1.width,
                    brick2.gpos.x, brick2.gpos.x + brick2.width)) {
                        
                    return false;                       // Fail for any collision
                }
            }

            // Check collision between current selected brick and every brick in its potential adjacent rows.
            for (var dir of OPPOSITE_DIRS) {             // For each direction

                // If row in the direction (above/below) has bricks, check each brick
                // For each brick in the row in that direction
                for (var brick2 of this.rows.find(r => r.row == tposy + dir)?.bricks || []) {
                    
                    if (!brick2.isSelected && col1D(    // If the brick-in-row is colliding with this brick
                        tposx, tposx + brick1.width,
                        brick2.gpos.x, brick2.gpos.x + brick2.width)) {

                        adjacents[dir] = true;          // Set adjacency state for this direction.
                        break;                          // Check other direction.
                    }
                }
            }
        }

        // LEVEL BOUNDARY CHECK - Check if this brick is inside the boundary
        if (colBoundingBoxGrid(min, max)) {
            return false;       // Fail if outside boundary
        }

        // CHARACTER - CHECK Check if any characters are in the current selection bounding box
        for(const c of this.characterHandler.getCharacterBoxes(min, max)) {

            // For each individual brick in the selection
            for (const b of this.bricks.filter(b => b.isSelected)) {

                // Check collision between each selected brick and the character
                if (colRectRectCornerSize(
                    c.gpos.x - 1,
                    c.gpos.x + 1,
                    c.gpos.y + 1 - c.height,
                    c.gpos.y + 1,
                    b.gpos.x + Math.round(b.spos.x / GMULTX),
                    b.gpos.y + Math.round(b.spos.y / GMULTY),
                    b.width,
                    1)) {

                    return false;
                }
            }
        }

        // We need to attach in one direction but not both. Return true if we are attaching in a single direction.
        // If adjacency states are different, return true
        return adjacents[-1] != adjacents[1];
    }

    /** Check collisons for a vertically-looping range and return a bitmask */
    public checkCollisionSuper(pos: Vect, start: number, final: number, height: number, dir: number): number {

        let collisions = 0;

        for(let i = start; i < final; i++) {

            let y = i % height;                 //Wrap by height
            let x = Math.floor(i / height) % 2; //Wrap by 2 to go back and check ceiling

            for (const brick of this.rows.find(r => r.row == pos.y + y + 1)?.bricks.filter(b => !b.isSelected) || []) {

                if(col1D(
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

    /** Check collisions for a row and return the colliding bricks */
    public checkCollisionRow(pos: Vect, width: number): Brick[] {

        let bricks : Brick[] = [];

        for (const brick of this.rows.find(r => r.row == pos.y)?.bricks.filter(b => !b.isSelected) || []) {

            if(col1D(
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
    cullBrickStuds(): void {
        
        // For each stud in unselected bricks
        for (const stud of this.bricks.filter(b => !b.isSelected).flatMap(b => b.studs)) {

            stud.isVisible = true;          // Unhide stud before rechecking its hidden status

            // For each brick in this stud's row
            for (const brick of this.rows.find(r => r.row == stud.gpos.y)?.bricks || []) {

                if (!brick.isSelected &&    // Don't cull selected bricks
                    !brick.isPressed &&     // Don't cull pressed bricks
                    col1D(                  // Only cull bricks overlapping with this stud
                        brick.gpos.x - 1, 
                        brick.gpos.x + brick.width, 
                        stud.gpos.x, 
                        stud.gpos.x
                    )) {

                    stud.isVisible = false;
                    break;                  // Stop all checks once the stud is hidden
                }
            }
        }

        // Always show studs for selected bricks
        this.bricks.filter(b => b.isSelected).flatMap(b => b.studs).forEach(s => s.isVisible = true);
    }

    /** Set the minimum and maximum position for selected bricks */
    public setSelectedMinMax(): void {
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
    }

    /** Set snapped state of selected bricks */
    public setSnappedBricks(state: boolean): void {

        // For each selected brick, set its snap to the given state
        this.bricks.filter(b => b.isSelected).forEach(b => b.snap(state));
    }

    /** Deselect all bricks */
    public deselectBricks(): void {

        this.selectedBrick = null;
        this.selections = [];
        this.bricks.forEach(b => b.deselect());

        // Move bricks to the new row
        this.rows.forEach(r => {                                // For each row
            var move = r.bricks.filter(b => b.gpos.y != r.row); // Get move-bricks that are no longer in this row
            r.bricks = r.bricks.filter(b => b.gpos.y == r.row); // Remove bricks that are no longer in this row
            move.forEach(b => this.addBrickToRows(b));          // For each move-brick, add it to its new row
        });

        // Sort
        this.sortRows();
    }

    /** Add a brick to a row, and create that row if it doesn't exist. */
    private addBrickToRows(brick: Brick): void {
        const currRow = this.rows.find(r => r.row == brick.gpos.y);

        // Create a new row or add a brick to the existing row
        if(currRow == null) {
            this.rows.push({
                row : brick.gpos.y, // Assign its first brick's position to the new row
                bricks : [brick]
            });
        } else {
            currRow.bricks.push(brick);
        }
    }

    /** Sort bricks */
    private sortRows(): void {

        // Sort rows by row value
        this.rows.sort((a, b) => a.row > b.row ? 1 : 0);

        // Sort bricks in each row by x-position
        this.rows.forEach(r => r.bricks.sort((a, b) => a.gpos.x > b.gpos.x ? 1 : 0));
    }

    /** Check all bricks for hover, return hover state */
    public hoverBricks(pos: Vect): BrickHandlerState {

        // Check all bricks and return if the first successful check is not static
        return this.checkBricks(pos, (b, p) => this.hoverBrick(b, p)) || BrickHandlerState.NONE;
    }

    /** Check all bricks for a mouse position and return the result of a function against that brick and position */
    private checkBricks<T>(pos: Vect, func: (brick: Brick, pos: Vect) => T): T | null {

        // Front face check
        for (const brick of this.bricks) {

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
        for (var brick of this.bricks) {
            if (
                // Top Face - if position is over this face
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

        // Do nothing if the two bricks are the same
        if (this.selectedBrick != null && this.selectedBrick.compare(brick) && !this.isPressured) {
            return BrickHandlerState.SAME;
        }

        this.isPressured = false;   // Reset pressured state
        this.selectedBrick = brick; // Set current selected brick for later use
        this.selections = [];       // Reset selections

        // Check both directions if they're valid (valid == not null)
        for (const dir of OPPOSITE_DIRS) {

            let selectionNew = this.recurseBrick(brick, [dir], true) ?? [];

            // If there are bricks to select
            if(selectionNew!.length > 0) {

                let floats = this.getFloatingBricks();

                // If every floating brick
                if(floats.every(b => b.pressure == 0)) {

                    this.selections[dir] = selectionNew.concat(floats);
                }
            }

            // Clear recursion states after each recursive direction check
            this.bricks.forEach(b => b.clearRecursion());
        }

        return this.selections[-1] && 
            this.selections[1]  ? BrickHandlerState.INDY :  // If both selections are valid, return indeterminate state
            this.selections[-1] ? BrickHandlerState.UP :    // If upward selection is valid, return up state
            this.selections[1]  ? BrickHandlerState.DOWN :  // If downward selection is valid, return down state
            BrickHandlerState.NONE;                         // No direction is valid. Return no state
    }

    /** Return floating bricks after a selection */
    private getFloatingBricks(): Brick[] {
        
        var ret : Brick[] = [];

        // Recursively check from all grey bricks and mark connected bricks as grounded
        for (const brick of this.bricksGrey) {
            // If the grey brick isn't checked (Reduces redundancy)
            if (!brick.isChecked) {
                this.recurseBrick(brick, OPPOSITE_DIRS, false)?.forEach(c => c.isGrounded = true);
            }
        }

        // Select floating bricks and clear recursion states
        // Stop trying to move the selected check! You know why it's there! 
        for (const brick of this.bricks) {
            if (!brick.isGrounded && !brick.isSelected) {
                ret.push(brick);
            }
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

        return !!selection;
    }

    /** Recursively select bricks. */
    private recurseBrick(brick1: Brick, dirs: (-1 | 1)[], checkGrey: boolean) {

        // Return nothing for grey bricks
        if (checkGrey && (brick1.isGrey || brick1.pressure > 0)) {
            return null;
        }

        brick1.isChecked = true;

        // Current brick is a new brick in the selection
        let selection = [brick1];

        // For all directions, check adjacent bricks in that direction and recurse for each brick
        for (const dir of dirs) {

            // If adjacent row in the direction (above/below) has bricks, check and recurse for each brick
            for (const brick2 of this.rows.find(r => r.row == brick1.gpos.y + dir)?.bricks || []) {

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
