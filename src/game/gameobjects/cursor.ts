import GameObject from "engine/gameobjects/gameobject";
import { MouseState } from "engine/modules/mouse";
import Scene from "engine/scene/scene";
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
    private ppos = Vect.zero;
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

    
    /** Level scene to track pausing */
    private levelScene: Scene | null = null;
    /** If level is paused */
    private get isPaused() : boolean { return this.levelScene?.isPaused ?? false }

    /** Initialize this cursor, get brickhandler and icon */
    public init(ctx: CanvasRenderingContext2D) {

        const brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0];
        if (!brickHandler) throw new Error("Can't find BrickHandler");
        this.brickHandler = brickHandler as BrickHandler;

        const cursorIcon = this.engine.tag.get("CursorIcon", "LevelInterface")[0];
        if (!cursorIcon) throw new Error("Can't find CursorIcon");
        this.cursorIcon = cursorIcon as CursorIcon;

        this.levelScene = this.engine.tag.getScene("Level");
    }

    public updateSync() {
        this.isUpdateForced = true;
    }

    /** Update this cursor */
    public update(dt: number): void {

        // If level is paused, set paused state and don't update
        if(this.isPaused) {
            this.enterPausedState();
            return;
        }

        let tempSpos = this.engine.mouse.pos;

        // Handle cursor state
        if (this.isUpdateForced || tempSpos.getDiff(this.spos)) {

            // Reset update forcing
            this.isUpdateForced = false;
            
            //Different actions depending on what the cursor is currently doing
            switch (this.state) {

                //If cursor is doing nothing, check and set hover state
                case CursorState.NONE:
                case CursorState.HOVER:
                    this.hoverBricks(tempSpos);
                    break;

                //If the cursor is dragging, recheck directions and handle them
                case CursorState.DRAG:
                    this.hoverBricksDrag(this.ppos);
                    break;

                //If the cursor is carrying, check if 
                case CursorState.CARRY:
                    this.isSnap = this.brickHandler.checkSelectionPlacement();
                    this.brickHandler.setSnappedBricks(this.isSnap);
                    break;
            }
        }

        // Set current position
        this.spos = tempSpos;

        // Handle mouse state
        switch (this.engine.mouse.mouseState) {

            // MOBILE - If a press event occurs in a NONE state/without a press (Only occurs on Mobile)
            case MouseState.WASPRESSED:

                if (this.state == CursorState.NONE) {

                    this.hoverBricks(this.spos);

                } 
                else if (this.state == CursorState.HOVER) {

                    // Direction of selection (0 for indeterminate)
                    let direction = this.brickHandler.pressBricks(this.spos)

                    // If pressing the brick returns truthy (up or down)
                    if (direction) {

                        this.enterCarryState();

                    } else {
                        
                        // No selection occurred - Indeterminate state.
                        // Set pressed position to the current cursor position
                        this.ppos = this.spos;
                        // Enter DRAG state to later determine what direction we're selecting in
                        this.enterDragState();
                    }
                }
                break;

            // Reset state upon release
            // If the current state is not carrying or if the bricks are snapped to a valid location
            case MouseState.WASRELEASED:

                if ((this.state != CursorState.CARRY || this.isSnap) && this.engine.mouse.isMaxed) {
                    
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

        //Check what directions are valid
        const hoverState = this.brickHandler.hoverBricks(pos);

        //Reset state if no directions, enter hover state otherwise
        switch(hoverState) {

            case BrickHandlerState.NONE:
                this.resetState();
                break;

            default:
                this.enterHoverState(hoverState);
                break;
        }
    }

    /** Hover over bricks, change state based on hover state, for DRAG state */
    private hoverBricksDrag(pos: Vect): void {

        //Check what directions are still valid
        const hoverState = this.brickHandler.hoverBricks(pos);

        //Handle all cases of new state
        switch(hoverState) {

            //There is no longer a valid direction, deselect
            case BrickHandlerState.NONE :
                this.resetState();
                this.brickHandler.deselectBricks();
                break;

            //There is now only one valid direction, select upwards
            case BrickHandlerState.UP :
                this.selectBricks(-1);
                break;

            //There is now only one valid direction, select downwards
            case BrickHandlerState.DOWN :
                this.selectBricks(1);
                break;

            //There are still two valid direction, handle it normally
            case BrickHandlerState.INDY :
        
                // Get difference between current and previously pressed positions
                const diff = this.spos.y - pos.y;

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
        }
    }

    /** Select bricks in a given direction */
    private selectBricks(dir: -1 | 1): void {

        // Initialize the selection. If doing so caused bricks to be carried, enter carry state
        if (this.brickHandler.initSelection(this.ppos, dir)) {

            this.enterCarryState();
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
    private enterHoverState(hoverState: BrickHandlerState): void {

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
    private enterDragState(): void {

        if (this.state != CursorState.DRAG) {

            this.cursorIcon.setCursor(CursorIconState.DRAG);
            this.brickHandler.cullBrickStuds();
            this.state = CursorState.DRAG;
        }
    }

    /** Set the cursor to its carry state */
    private enterCarryState(): void {

        if (this.state != CursorState.CARRY) {

            this.cursorIcon.setCursor(CursorIconState.CARRY);
        
            this.brickHandler.cullBrickStuds();         // Reset culled studs
            this.brickHandler.setSnappedBricks(true);   // Carried bricks should start as snapped
            this.engine.mouse.setMouseOffset(-1);      // Set mouse offset to match selection direction

            this.state = CursorState.CARRY;             // Set state to NONE stateStart carrying if we selected some bricks
        }
    }

    /** Set the cursor to its paused state */
    private enterPausedState() : void {
        
        this.cursorIcon.setCursor(CursorIconState.NONE);
    }
}