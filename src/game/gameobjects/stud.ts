import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { colorTranslate, getZIndex, GMULTX, GMULTY, MOBILE_PREVIEW_MAX, UNDER_CURSOR_Z_INDEX, Z_DEPTH } from "engine/utilities/math";
import Vect from "engine/utilities/vect";

interface StudParams extends GameObjectParams {
    color?: string;
}

/** Series of studs for a brick */
export default class Stud extends GameObject {
    color: string;

    image : HTMLImageElement;

    private isPressed : boolean = false;
    private isSelected : boolean = false;
    private isSnapped : boolean = false;
    public isVisible : boolean = true;
    public mobilePreviewSize : Vect = new Vect(0, 0);
    private isMobileFlipped : boolean = false;

    constructor(params: StudParams) {
        super(params);

        this.color = colorTranslate(params.color);

        this.image = this.engine.library.getImage(`stud_${this.color.replace("#", "").toLowerCase()}`);
    }

    public draw(ctx: CanvasRenderingContext2D): void {

        if(this.isVisible) {
            
            // Global transparency for selection states
            ctx.globalAlpha =
                this.isSnapped ? 0.75:  // Snapped studs are transparent
                this.isSelected ? 0.5:  // Selected studs are more transparent
                this.isPressed ? 0.75:  // Pressed studs are less transparent again
                1.0;                    // Otherwise opaque if not selected or pressed
            
            // Draw the stored image for this stud
            ctx.drawImage(this.image, Z_DEPTH - 13, 0);
        }
    }    
    
    public superDraw(ctx: CanvasRenderingContext2D): void {

        if (this.engine.mouse.getMouseType() == "mouse" ||
           !this.isSelected || 
           !MOBILE_PREVIEW_MAX.getLessOrEqual(this.mobilePreviewSize)) {
            return;
        }

        ctx.drawImage(
            this.image, 
            Z_DEPTH - 13.5, 
            - GMULTY * (
                this.isMobileFlipped ? 
                -this.mobilePreviewSize.y - 3.2 :
                this.mobilePreviewSize.y + 3.5 ));
    }

    /** Get z-index for draw sorting */
    public getGOZIndex() : number {

        // Set z-index to draw this brick in its snapped position
        if(this.isSnapped) {
            return getZIndex(
                this.gpos.getAdd({
                    x : Math.round(this.spos.x / GMULTX),
                    y : Math.round(this.spos.y / GMULTY)
                }),
                1);
        }        
        // Set z-index to draw this brick under the cursor
        if(this.isSelected) {
            return UNDER_CURSOR_Z_INDEX;
        }
        //Normal z-index
        else {
            return getZIndex(this.gpos, 1);
        }
    }

    /** Set this stud's snap state */
    public snap(state: boolean): void {
        
        this.isSnapped = state;
    }

    /** Setup this stud for pressing */
    public press(): void {
        this.isPressed = true;
    }

    /** Setup this stud for selecting */ 
    public select(): void {
        this.isSelected = true;
    }

    /** Reset this stud's z-index */
    public deselect(): void {
        this.isPressed = false;
        this.isSelected = false;
        this.isSnapped = false;
    }

    /** Set the flipped state for the mobile preview */
    public flipMobile(isFlipped : boolean) {
        
        this.isMobileFlipped = isFlipped;
    }
}