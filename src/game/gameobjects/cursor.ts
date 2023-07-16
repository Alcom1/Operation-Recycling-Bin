import GameObject from "engine/gameobjects/gameobject";
import { MouseState } from "engine/modules/mouse";
import Vect from "engine/utilities/vect";
import BrickHandler, { BrickHandlerState } from "./brickhandler";
import CursorIcon, { CursorIconState } from "./cursoricon";

/** */
enum CursorState {
    NONE,
    DRAG,
    CARRY,
    HOVER
}

/** */
export default class Cursor extends GameObject {

    /** Previous pressed position */
    private ppos = new Vect(0, 0);
    /** Distance to enter carry state */
    private pLength = 10;

    /** State for the cursor */
    private state = CursorState.NONE;
    /** State for the brickhandler */
    private hoverState = BrickHandlerState.NONE;
    /** If the current selection is being snapped to the grid */
    private isSnap = false;
    /** If an update is being forced */
    private isUpdateForced = false;

    /** Brick handler to check bricks */
    private brickHandler!: BrickHandler;

    /** Cursor icon to display */
    private cursorIcon!: CursorIcon;

    /** Initialize this cursor, get brickhandler and icon */
    public init(ctx: CanvasRenderingContext2D) {

        const brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
        if (!brickHandler) throw new Error("Can't find BrickHandler");
        this.brickHandler = brickHandler as BrickHandler;

        const cursorIcon = this.engine.tag.get("CursorIcon", "LevelInterface")[0];
        if (!cursorIcon) throw new Error("Can't find CursorIcon");
        this.cursorIcon = cursorIcon as CursorIcon;
    }

    /** Update this cursor */
    public update(dt: number): void {

        var tempSpos = this.engine.mouse.getPos();

        // Handle cursor state
        if (this.isUpdateForced || tempSpos.getDiff(this.spos)) {

            // Reset update forcing
            this.isUpdateForced = false;
            
            switch (this.state) {

                case CursorState.NONE:
                case CursorState.HOVER:
                    this.hoverBricks(tempSpos);
                    break;

                case CursorState.DRAG:
                    // Get difference between current and previously pressed positions
                    const diff = this.spos.y - this.ppos.y;

                    // Math.sign only ever returns +/-1, +/-0, or NaN. It won't be NaN,
                    // and it can never be 0, because we've ensured it's greater than pLength,
                    // which is never going to be negative anyways
                    const dir = Math.sign(diff) as (-1 | 1);

                    // If we've dragged a sufficient distance and no bricks in the chosen direction are pressured
                    if (Math.abs(diff) > this.pLength) {
                        
                        // Select bricks in the direction of the difference
                        this.selectBricks(dir);
                    }
                    break;

                case CursorState.CARRY:
                    this.isSnap = this.brickHandler.checkCollisionSelection();
                    this.brickHandler.setSnappedBricks(this.isSnap);
                    break;
            }
        }

        // Set current position
        this.spos = tempSpos;

        // Handle mouse state
        switch (this.engine.mouse.getMouseState()) {

            // MOBILE - If a press event occurs in a NONE state/without a press (Only occurs on Mobile)
            case MouseState.WASPRESSED:

                if (this.state == CursorState.NONE) {

                    this.hoverBricks(this.spos);

                } else if (this.state == CursorState.HOVER) {

                    // If pressing the brick returns true (Indeterminate state)
                    if (this.brickHandler.pressBricks(this.spos)) {

                        this.carry();

                    } else {
                        // No selection occurred - Indeterminate state.
                        // Set pressed position to the current cursor position
                        this.ppos = this.spos;
                        // Enter DRAG state to later determine what direction we're selecting in
                        this.drag();
                    }
                }
                break;

            // Reset state upon release
            // If the current state is not carrying or if the bricks are snapped to a valid location
            case MouseState.WASRELEASED:

                if (this.state != CursorState.CARRY || this.isSnap) {
                    
                    this.brickHandler.deselectBricks();

                    // If we are deselecting bricks
                    if (this.isSnap) {
                        this.brickHandler.cullBrickStuds();
                    }

                    this.isUpdateForced = true;
                    this.resetState();
                }
                break;
        }
    }

    /** Hover over bricks, change state based on hover state */
    private hoverBricks(pos: Vect): void {

        const hoverState = this.brickHandler.hoverBricks(pos);

        switch(hoverState) {
            case BrickHandlerState.NONE:
                this.resetState();
                break;

            case BrickHandlerState.SAME:
                break;

            default:
                this.hover(hoverState);
                break;
        }
    }

    /** Select bricks in a given direction */
    private selectBricks(dir: -1 | 1): void {

        // Initialize the selection. If doing so caused bricks to be carried, enter carry state
        if (this.brickHandler.initSelection(this.ppos, dir)) {

            this.carry();
        }  
    }

    /** Set cursor to no state */
    private resetState(): void {

        if (this.state != CursorState.NONE) {

            this.cursorIcon.setCursor(CursorIconState.NONE);
            // Ensure no brick is selected in the NONE state
            this.brickHandler.selectedBrick = null;
            this.state = CursorState.NONE;
        }
    }

    /** Set cursor to its over state */
    private hover(hoverState: BrickHandlerState): void {

        if (this.state != CursorState.HOVER || this.hoverState != hoverState) {

            switch(hoverState) {

                case BrickHandlerState.INDY:
                    this.cursorIcon.setCursor(CursorIconState.HOVER);
                    break;

                case BrickHandlerState.UP:
                    this.cursorIcon.setCursor(CursorIconState.HOVERUP);
                    break;

                case BrickHandlerState.DOWN:
                    this.cursorIcon.setCursor(CursorIconState.HOVERDOWN);
                    break;
            }

            this.state = CursorState.HOVER;
            this.hoverState = hoverState;
        }
    }

    /** Set the cursor to its drag state */
    private drag(): void {

        if (this.state != CursorState.DRAG) {

            this.cursorIcon.setCursor(CursorIconState.DRAG);
            this.brickHandler.cullBrickStuds();
            this.state = CursorState.DRAG;
        }
    }

    /** Set the cursor to its carry state */
    carry(): void {

        if (this.state != CursorState.CARRY) {

            this.cursorIcon.setCursor(CursorIconState.CARRY);
        
            this.brickHandler.cullBrickStuds();             // Reset culled studs
            this.brickHandler.setSnappedBricks(true);       // Carried bricks should start as 
            this.brickHandler.setSelectedMinMax(this.spos); // Set minimum and maximum position of carried bricks

            this.state = CursorState.CARRY;                 // Set state to NONE stateStart carrying if we selected some bricks
        }
    }
}