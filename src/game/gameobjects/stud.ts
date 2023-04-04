import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { colorTranslate, GMULTX, GMULTY, MOBILE_PREVIEW_MAX, UNDER_CURSOR_Z_INDEX, Z_DEPTH } from "engine/utilities/math";
import Vect from "engine/utilities/vect";

/** Stud parameters */
interface StudParams extends GameObjectParams {
    color?: string;
}

/** Pair of studs for a brick */
export default class Stud extends GameObject {

    private color: string;                              // Stud color
    private image : HTMLImageElement;                   // Image of a pair of studs
    private isPressed : boolean = false;                // Brick is pressed
    private isSelected : boolean = false;               // Brick is selected
    private isSnapped : boolean = false;                // Brick is snapped
    public isVisible : boolean = true;                  // Stud is visible and should be drawn
    public mobilePreviewSize : Vect = new Vect(0, 0);   // Size for mobile preview
    private isMobileFlipped : boolean = false;          // flipped state for mobile preview

    /** Constructor */
    constructor(params: StudParams) {
        super(params);

        this.color = colorTranslate(params.color);

        this.tags = ["Stud"];

        this.image = this.engine.library.getImage(`stud_${this.color.replace("#", "").toLowerCase()}`);
    }

    /** Draw studs */
    public draw(ctx: CanvasRenderingContext2D): void {

        if (this.isVisible) {
            
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

    /** Draw mobile preview */
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