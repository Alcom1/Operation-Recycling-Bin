import GameObject from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import {colBorderBoxGrid, col1D, GMULTX, GMULTY, colPointRectGrid, colPointParHGrid, colPointParVGrid, OPPOSITE_DIRS} from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import Brick from "./brick";

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
    /** Rows of bricks */
    private rows: BrickRow[] = [];
    /** All bricks */
    private bricks: Brick[] = [];
    /** Current selected bricks */
    public selectedBrick: Brick | null = null;
    /** All selected bricks */
    private selections: (Brick[] | null)[] = [];

    /** Grey bricks */
    private get bricksGrey(): Brick[] {
        return this.bricks.filter(b => b.isGrey == true);
    }

    public init(ctx: CanvasRenderingContext2D, scenes: Scene[]) {
        
        this.bricks = this.engine.tag.get("Brick", "Level") as Brick[]; // Get bricks from scene
        this.bricks.forEach(b => this.addBrickToRows(b));               // Add bricks into rows
        this.sortRows();                                                // Sort rows/bricks within rows

        //Check for and log overlapping bricks
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

        this.cullBrickStuds();                                          // Initial stud culling
    }

    /** Check selection collision, return true if this is a valid position **/
    public checkSelectionCollision(): boolean {

        const adjacents = [];       // Adjacency states, contains if we're attaching in the indexed direction.

        for (const brick1 of this.bricks.filter(b => b.isSelected)) {
            
            brick1.setToCursor();   // Force update so the brick position matches this frame and not the previous

            // Combine grid positions and sub positions for true positions
            var tposx = brick1.gpos.x + Math.round(brick1.spos.x / GMULTX);
            var tposy = brick1.gpos.y + Math.round(brick1.spos.y / GMULTY);

            // Check if this brick is inside the boundary
            if (colBorderBoxGrid(tposx, tposy, brick1.width)) {
                return false;       // Fail if outside boundary
            }

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

        // We need to attach in one direction but not both. Return true if we are attaching in a single direction.
        // If adjacency states are different, return true
        return adjacents[-1] != adjacents[1];
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
        
        //Maximum brick position among selected bricks
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

        //Move bricks to the new row
        this.rows.forEach(r => {                                //For each row
            var move = r.bricks.filter(b => b.gpos.y != r.row); //Get move-bricks that are no longer in this row
            r.bricks = r.bricks.filter(b => b.gpos.y == r.row); //Remove bricks that are no longer in this row
            move.forEach(b => this.addBrickToRows(b));          //For each move-brick, add it to its new row
        });

        //Sort
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

            //Front face - if position is over this face
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
        if (this.selectedBrick != null && this.selectedBrick.compare(brick)) {
            return BrickHandlerState.SAME;
        }

        this.selectedBrick = brick; // Set current selected brick for later use
        this.selections = [];       // Reset selections

        // Check both directions if they're valid (valid == not null)
        for (const dir of OPPOSITE_DIRS) {

            // Recurse in that direction. Assign result to valid directions.
            this.selections[dir] = this.recurseBrick(brick, [dir], true);
        }

        // Clear recursion states after both recursive direction checks
        this.bricks.forEach(b => b.clearRecursion());

        return this.selections[-1] && 
            this.selections[1]  ? BrickHandlerState.INDY :  // If both selections are valid, return indeterminate state
            this.selections[-1] ? BrickHandlerState.UP :    // If upward selection is valid, return up state
            this.selections[1]  ? BrickHandlerState.DOWN :  // If downward selection is valid, return down state
            BrickHandlerState.NONE;                         // No direction is valid. Return no state
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

        // Select floating bricks (bricks with no relation to a grey brick after initial selection)
        if (selection != null) {

            // Recursively check from all grey bricks and mark connected bricks as grounded
            for (const brick of this.bricksGrey) {
                // If the grey brick isn't checked (Reduces redundancy)
                if (!brick.isChecked) {
                    this.recurseBrick(brick, OPPOSITE_DIRS, false)?.forEach(c => c.isGrounded = true);
                }
            }

            // Select floating bricks and clear recursion states
            //Stop trying to move the selected check! You know why it's there! 
            for (const brick of this.bricks) {
                if (!brick.isGrounded && !brick.isSelected) { 
                    brick.select(pos);
                }
                brick.clearRecursion();
            }
        }

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
