import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { BOUNDARY, GMULTX, GMULTY, TOUCH_EFFECT_MAX, round } from "engine/utilities/math";
import Vect from "engine/utilities/vect";

/** Selection indicator for mobile devices */
export default class MobileIndicator extends GameObject {
    
    /** Position offset of the indicator */
    protected mobileOffset : Vect = Vect.zero;

    /** If selection is snapped */
    protected isSnapped : boolean = false;

    /** Size of carried selection */
    protected size : Vect = Vect.zero;

    /** Stored cursor position from moment of selection */
    protected _cursorPosition : Vect = Vect.zero;
    public set cursorPosition(value : Vect) {
        this._cursorPosition = value;
    }

    /** Constructor */
    constructor(params: GameObjectParams) {
        super(params);

        this.tags.push("MobileIndicator");
        this.isActive = false;
        this.zIndex = 1;
    }

    /** Update the indicator to match mouse position. */
    public update(dt: number) {

        // Get mouse position, clamped within level borders.
        this.spos = this.engine.mouse.pos.getSub(this.mobileOffset);
    }
    
    /** Set selection boundaries */
    public setMinMax(min: Vect, max: Vect): void {

        // Activate
        this.isActive = true;

        // Set box that collides with boundary
        this.size = max.getSub(min);
    }
    
    /** Set snapped state (should be a setter?) */
    public snap(state : boolean) {

        this.isSnapped = state;
    }

    /** Utility boundary clamp to keep visuals inside gameplay boundary */
    protected getBoundaryClamp(offset = Vect.zero) : Vect {
        
        return this.spos.getClamp({
            // Clamp above minimum-x position
            x: (BOUNDARY.minx) * GMULTX + offset.x,
            // Clamp above minimum-y position
            y: (BOUNDARY.miny) * GMULTY + offset.y
        }, {  
            // Clamp below maximum-x position
            x: (BOUNDARY.maxx - this.size.x) * GMULTX + offset.x,
            // Clamp below maximum-y position
            y: (BOUNDARY.maxy - this.size.y) * GMULTY + offset.y
        });
    }
}
