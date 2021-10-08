import GameObject, {GameObjectParams} from "engine/gameobjects/gameobject";
import Engine from "engine/engine";
import { colorTranslate, GMULTY, Z_DEPTH, GMULTX, BOUNDARY, round, UNDER_CURSOR_Z_INDEX, getZIndex, MOBILE_PREVIEW_MAX } from "engine/utilities/math";
import Vect, {Point} from "engine/utilities/vect";
import BrickStud from "./brickstud";

export interface BrickBaseParams extends GameObjectParams {
    color?: string;
    width?: number;
}

export default class BrickBase extends GameObject {

    /** The color of this brick */
    protected color: string;

    /** If this is a grey brick */
    public isGrey: boolean;

    /** Baked image data for this brick */
    protected image = new Image();

    /** If this is a static brick that will never move (grey or blocked by grey bricks), calculated later */
    public isStatic = false;

    /** Width of this brick */
    public width: number;

    /** If this brick is pressed */
    public isPressed = false;

    /** If this brick is selected */
    public isSelected = false;

    /** If this brick is snapped to a position */
    private isSnapped = false;

    /** Relative selected position */
    private selectedPos = new Vect(0, 0);

    /** Temporary recursion state */
    public isGrounded = false;

    /** Temporary recursion state */
    public isChecked = false;

    /** Number of objects on top of this brick */
    public pressure = 0;

    /** Boundary offset for minimum carried position */
    private minCarry : Vect = new Vect(0, 0);

    /** Boundary offset for maximum carried position */
    private maxCarry : Vect = new Vect(0, 0);

    /** Vertical offset for mobile devices*/
    protected mobilePreviewSize : Vect = new Vect(0, 0);

    /** If the mobile preview is flipped */
    private isMobileFlipped : Boolean = false;

    constructor(protected engine: Engine, params: BrickBaseParams) {
        super(engine, params);
        
        this.color = colorTranslate(params.color);
        this.isGrey = !params.color;

        this.tags.push("BrickBase");

        this.width = params.width || 1;
        // Z-sort vertically and then horizontally.
        this.zIndex = getZIndex(this.gpos, this.width * 10);
    }

    public update(dt: number): void {

        // Follow mouse if selected
        if (this.isSelected) {
            this.setToCursor();
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {

        // Global transparency for selection states
        ctx.globalAlpha =
            this.isSnapped ? 0.75 : // Snapped bricks are transparent
            this.isSelected ? 0.4 : // Selected bricks are more transparent
            this.isPressed ? 0.75 : // Pressed bricks are less transparent again
            1.0;                    // Otherwise opaque if not selected or pressed
        
        // Draw with vertical offset for top face
        ctx.drawImage(this.image, 0, -Z_DEPTH - 3);
    }

    public superDraw(ctx: CanvasRenderingContext2D): void {

        if (this.engine.mouse.getMouseType() == "mouse" ||
           !this.isSelected || 
           !MOBILE_PREVIEW_MAX.getLessOrEqual(this.mobilePreviewSize)) {
            return;
        }

        //Draw mobile view
        ctx.drawImage(
            this.image, 
            0, 
            - Z_DEPTH 
            - 3 
            - GMULTY * (
                this.isMobileFlipped ? 
               -this.mobilePreviewSize.y - 3.2 :
                this.mobilePreviewSize.y + 3.5));
    }

    /** Setup this brick for pressing */
    public press(): void {

        // Can't press static bricks
        if (!this.isStatic) {
            this.isPressed = true;
        }
    }

    /** Setup this brick for selecting */
    public select(pos: Point): void {

        // This brick is now selected
        this.isSelected = true;
        // Check so this brick is ignored for float checks
        this.isChecked = true;
        // Store mouse's current position for relative calculations later
        this.selectedPos.set(pos);
        // Set z-index to draw this brick under the cursor
        this.zIndex = UNDER_CURSOR_Z_INDEX;
    }

    /** Clear this brick's selection states */
    public deselect(): void {

        // Restore grid position for deselection
        if (this.isSelected) {
            // Snap sub position to the grid for the new position
            this.gpos.set(
                this.gpos.x + Math.round(this.spos.x / GMULTX),
                this.gpos.y + Math.round(this.spos.y / GMULTY)
            );
        }

        // Restore states & values
        this.isPressed = false;
        this.isSelected = false;
        this.isSnapped = false;
        this.isChecked = false; //Fixed bug where selections dragged offscreen wouldn't clear correctly.
        this.spos.set(0, 0);
        this.selectedPos.set(0, 0);
        this.zIndex = getZIndex(this.gpos, this.width * 10);
        // Reset studs to match the final brick position
    }

    /** Set the brick to match the cursor position, based on its stored selected position */
    public setToCursor(): void {

        // Position based difference between stored selected position and new cursor position
        // Brick position is its position relative to the cursor
        this.spos = this.engine.mouse.getPos().getSub(this.selectedPos).getClamp({
            // Clamp above minimum-x position
            x: (BOUNDARY.minx - this.minCarry.x) * GMULTX,
            // Clamp above minimum-y position
            y: (BOUNDARY.miny - this.minCarry.y) * GMULTY
        }, {  
            // Clamp below maximum-x position
            x: (BOUNDARY.maxx - this.maxCarry.x) * GMULTX,
            // Clamp below maximum-y position
            y: (BOUNDARY.maxy - this.maxCarry.y) * GMULTY
        });    

        // Grid positioning
        if (this.isSnapped) {
            this.spos.set({
                x : round(this.spos.x, GMULTX),
                y : round(this.spos.y, GMULTY)
            });
        }
    }

    /** Snap this brick to the grid based on the given state */
    public snap(state: boolean): void {

        // Snap or unsnap based on the given state
        if (state) {
            this.isSnapped = true;
            this.zIndex = getZIndex(this.gpos.getAdd({
                x : Math.round(this.spos.x / GMULTX),
                y : Math.round(this.spos.y / GMULTY)
            }),
            this.width * 10);
        } else {
            this.isSnapped = false;
            // Set Z-index for dragging
            this.zIndex = UNDER_CURSOR_Z_INDEX;
            // Reposition for unsnapped state to fix 1-frame jump on pickup
            this.setToCursor();
        }
    }

    /** Clear this brick's recursion states */
    public clearRecursion() {
        this.isGrounded = false;
        this.isChecked = false;
    }

    /** Set the minimum and maximum carry positions of this brick */
    public setMinMax(min: Vect, max: Vect): void {

        this.minCarry = min;
        this.maxCarry = max;

        this.mobilePreviewSize = max.getSub(min); //asdf
    }

    /** Set the flipped state for the mobile preview */
    public flipMobile(isFlipped : boolean) {

        this.isMobileFlipped = isFlipped;
    }
}