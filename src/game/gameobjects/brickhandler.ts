import GameObject from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import {colBorderBoxGrid, col1D, GMULTX, GMULTY, colPointRectGrid, colPointParHGrid, colPointParVGrid} from "engine/utilities/math";
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

    public init(ctx: CanvasRenderingContext2D, scenes: Scene[]) {
        // Get bricks from scene
        this.bricks = this.engine.tag.get("Brick", "Level") as Brick[];

        // Add bricks into rows
        this.bricks.forEach(b => this.addBrickToRows(b));

        // Sort rows/bricks within rows
        this.sortRows();

        // For each brick, do a recursive check in each direction.
        // If both directions are blocked, it's static.
        for (const b of this.bricks) {
            // Recurse in both directions. If both results are null, set brick to static
            const dirs = [-1, 1] as const;
            b.isStatic = dirs.reduce<boolean>((a, c) => a && !this.recurseBrick(b, [c], true), true);
            // Clear recursion states after each recursive static check
            this.bricks.forEach(b => b.clearRecursion());
        }

        // Initial stud culling
        this.cullBrickStuds();
    }

    /** Grey bricks */
    private get bricksGrey(): Brick[] {
        return this.bricks.filter(b => b.isGrey == true);
    }

    /** Check selection collision, return true if this is a valid position **/
    public checkSelectionCollision(): boolean {
        // Adjacency states, contains if we're attaching in the indexed direction.
        const adjacents = [];

        for (const brick1 of this.bricks.filter(b => b.isSelected)) {
            // Force update so the brick position matches this frame and not the previous
            brick1.setToCursor();

            // Combine grid positions and sub positions for true positions
            var tposx = brick1.gpos.x + Math.round(brick1.spos.x / GMULTX);
            var tposy = brick1.gpos.y + Math.round(brick1.spos.y / GMULTY);

            // Check if this brick is inside the boundary
            if (colBorderBoxGrid(tposx, tposy, brick1.width)) {
                // Fail if outside boundary
                return false;
            }

            // Check collision between current selected brick and every brick in its potential new row.
            // For each brick in the current row
            for (const brick2 of this.rows.find(r => r.row == tposy)?.bricks || []) {
                // If the brick-in-row is colliding with this brick
                if (!brick2.isSelected && col1D(
                    tposx, tposx + brick1.width,
                    brick2.gpos.x, brick2.gpos.x + brick2.width)
                ) {
                    // Fail for any collision
                    return false;
                }
            }

            // Check collision between current selected brick and every brick in its potential adjacent rows.
            // For each direction
            for (var dir of [-1, 1]) {
                // If row in the direction (above/below) has bricks, check each brick
                // For each brick in the row in that direction
                for (var brick2 of this.rows.find(r => r.row == tposy + dir)?.bricks || []) {
                    // If the brick-in-row is colliding with this brick
                    if (!brick2.isSelected && col1D(
                        tposx, tposx + brick1.width,
                        brick2.gpos.x, brick2.gpos.x + brick2.width)
                    ) {
                        // Set adjacency state for this direction.
                        adjacents[dir] = true;
                        // Check other direction.
                        break;
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
            stud.isVisible = true;

            // For each brick in this stud's row
            for (const brick of this.rows.find(r => r.row == stud.gpos.y)?.bricks || []) {
                if (
                    // Don't cull selected bricks
                    !brick.isSelected
                    // Don't cull pressed bricks
                    && !brick.isPressed
                    // Only cull bricks overlapping with this stud
                    && col1D(
                        brick.gpos.x - 1, 
                        brick.gpos.x + brick.width, 
                        stud.gpos.x, 
                        stud.gpos.x
                    )
                ) {
                    stud.isVisible = false;
                    // Stop all checks once the stud is hidden
                    break;
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
            // Width included for proper boundary
            Math.max(...selected.map(b => b.gpos.x + b.width)),
            // Height included for proper boundary
            Math.max(...selected.map(b => b.gpos.y + 1))
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
                // Set new row position to its first brick's position
                row : brick.gpos.y,
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
                )
                // Side Face - if position is over this face
                || colPointParVGrid(
                    pos.x,
                    pos.y,
                    brick.gpos.x,
                    brick.gpos.y,
                    brick.width
                )
            ) {
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

        // Set current selected brick for later use
        this.selectedBrick = brick;
        // Reset selections
        this.selections = [];

        // Check both directions if they're valid (valid == not null)
        const dirs = [-1, 1] as const;
        for (const dir of dirs) {
            // Recurse in that direction. Assign result to valid directions.
            this.selections[dir] = this.recurseBrick(brick, [dir], true);
        }
        // Clear recursion states after both recursive direction checks
        this.bricks.forEach(b => b.clearRecursion());

        return this.selections[-1] && 
            // If both selections are valid, return indeterminate state
            this.selections[1]  ? BrickHandlerState.INDY :
            // If upward selection is valid, return up state
            this.selections[-1] ? BrickHandlerState.UP :
            // If downward selection is valid, return down state
            this.selections[1]  ? BrickHandlerState.DOWN :
            // No direction is valid. Return no state
            BrickHandlerState.NONE;
    }

    /**
     * Check all bricks for press, return press state (none, processed, indeterminate)
     * This entire function is bananas.
     */
    public pressBricks(pos: Vect): boolean {
        // Build an normal array of selections that are not null (invalid)
        // Filter to remove null (invalid) selections
        const validSelections = [
            this.selections[-1], 
            this.selections[1]
        ].filter(s => s);

        // If there is a single valid selection, use and auto-process it
        if (validSelections.length == 1) {
            // Process this selection using bricks in truthy direction, and the position.
            return this.processSelection(validSelections[0], pos);
        }

        // For the indeterminate state, just press this brick
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

        // Mark all bricks that lead to a grey brick as grounded (not floating).
        if (selection != null) {
            for (const brick of this.bricksGrey) {
                // If the grey brick isn't checked (Reduces redundancy)
                if (!brick.isChecked) {
                    this.recurseBrick(brick, [-1, 1], false)?.forEach(c => c.isGrounded = true);
                }
            }

            // Select floating bricks and clear recursion states
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
                    brick2.gpos.x, brick2.gpos.x + brick2.width
                )) {
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
