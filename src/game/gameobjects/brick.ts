import GameObject, {GameObjectParams} from "engine/gameobjects/gameobject";
import { TouchStyle } from "engine/modules/settings";
import { colorTranslate, GMULTY, Z_DEPTH, GMULTX, BOUNDARY, round, TOUCH_EFFECT_MAX, TOUCH_PUSH_OFFSET } from "engine/utilities/math";
import Vect, {Point} from "engine/utilities/vect";

export interface BrickParams extends GameObjectParams {
    color?: string;
    width?: number;
    blockStrength?: number;
    glide?: boolean;
}

/** Base class for all bricks */
export default class Brick extends GameObject {

    /** The color of this brick */
    protected color: string;

    /** If this is a grey brick */
    private _isGrey: boolean; public get isGrey(): boolean { return this._isGrey; }

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
    private selectedPos = Vect.zero;

    /** Temporary recursion state */
    public isGrounded = false;

    /** Temporary recursion state */
    public isChecked = false;

    /** Boundary offset for minimum carried position */
    private minCarry : Vect = Vect.zero;

    /** Boundary offset for maximum carried position */
    private maxCarry : Vect = Vect.zero;

    /** Vertical offset for mobile devices*/
    protected mobilePreviewSize : Vect = Vect.zero;

    /** If the mobile preview is flipped */
    private isMobileFlipped : Boolean = false;

    /** 
     * Strength of this block's ability to block placement 
     * 0 = No blocking
     * 1 = Bricks underneath cannot be moved (used by characters, their phantom bricks)
     * 2 = Bricks cannot be placed above or below (used by static tiles)
     */
    protected _blockStrength : number = 0; public get blockStrength() : number {return this._blockStrength};

    /** If the brick is attatched to a gliding object */
    protected _isGlide : boolean = false; public get isGlide() : boolean {return this._isGlide};

    /** z-index get/setters */
    get zIndex() : number { return super.zIndex; }
    set zIndex(value : number) { 
        super.zIndex = value + (this.isSelected && !this.isSnapped ? 2000 : 0);
    }
    get zpos() : Point { 
        return (
            this.isSelected ?
            this.gpos.getAdd({
                x : Math.floor(this.spos.x / GMULTX),
                y : Math.floor(this.spos.y / GMULTY),
            }) :
            super.zpos); 
    }
    public get zSize() : Point { return {x : this.width, y : 1 }; }
    public get zLayer() : Number { return this.isSelected && !this.isSnapped ? 1 : 0 }
    public get zStatic() : Boolean { return this.isGrey }

    /** Constructor */
    constructor(params: BrickParams) {
        super(params);
        
        this.color = colorTranslate(params.color);
        this._isGrey = !params.color;
        this._blockStrength = params.blockStrength ?? 0;
        this._isGlide = params.glide ?? false;

        this.tags.push("Brick");

        this.width = params.width || 1;
    }

    /** Update brick, move it along the cursor if it's selected. */
    public update(dt: number): void {

        // Follow mouse if selected
        if (this.isSelected) {
            this.setToCursor();
        }
    }

    /** Draw brick */
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

    /** Draw mobile preview above everything */
    public superDraw(ctx: CanvasRenderingContext2D): void {

        // Debug Z-index
        // let indexDisplay = "" + this.zIndex;
        // let indexPos : Point = { x : 5, y : GMULTY - 15};
        // ctx.strokeStyle = "#000";
        // ctx.fillStyle = "#FFF"
        // ctx.lineWidth = 2;
        // ctx.font = " 20px Monospace"
        // ctx.strokeText(indexDisplay, indexPos.x, indexPos.y);
        // ctx.fillText(indexDisplay, indexPos.x, indexPos.y);

        // Only draw preview if on browser, this brick is selected, and the selection size is large enough
        if (this.engine.mouse.mouseType == "mouse" ||
            this.engine.settings.getNumber("touchStyle") != TouchStyle.PREV ||
           !this.isSelected || 
           !TOUCH_EFFECT_MAX.getLessOrEqual(this.mobilePreviewSize)) {
            return;
        }

        // Draw mobile view
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
        this.isChecked = false; // Fixed bug where selections dragged offscreen wouldn't clear correctly.
        this.spos.setToZero();
        this.selectedPos.setToZero();
        // Reset studs to match the final brick position
    }

    /** Set the brick to match the cursor position, based on its stored selected position */
    public setToCursor(): void {

        // Special push offset for touch screens, set to zero if mouse, not push, or selection is large.
        let touchOffset =
            this.engine.mouse.mouseType == "mouse" ||
            this.engine.settings.getNumber("touchStyle") != TouchStyle.PUSH ||
            this.maxCarry.x - this.minCarry.x > TOUCH_EFFECT_MAX.x ||
            this.maxCarry.y - this.minCarry.y > TOUCH_EFFECT_MAX.y ?
            Vect.zero :
            this.engine.mouse.off.getMult(
                TOUCH_PUSH_OFFSET +         // Baseline offset
                GMULTY / 2 * Math.max(      // Increase offset based on selection size
                    this.maxCarry.x - this.minCarry.x, 
                    this.maxCarry.y - this.minCarry.y));

        // Position based difference between stored selected position and new cursor position
        // Brick position is its position relative to the cursor
        this.spos = this.engine.mouse.pos.getAdd(touchOffset).getSub(this.selectedPos).getClamp({
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
        this.isSnapped = state;

        // Reposition for unsnapped state to fix 1-frame jump on pickup
        if (!this.isSnapped) {            
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

        this.mobilePreviewSize = max.getSub(min); // asdf
    }

    /** Set the flipped state for the mobile preview */
    public flipMobile(isFlipped : boolean) {

        this.isMobileFlipped = isFlipped;
    }
}