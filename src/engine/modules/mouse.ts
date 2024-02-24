import Engine from "engine/engine";
import Vect from "engine/utilities/vect";

export enum MouseState {
    /** Mouse is not pressed */
    ISRELEASED,
    /** Mouse was pressed last frame */
    WASPRESSED,
    /** Mouse is pressed */
    ISPRESSED,
    /** Mouse was released last frame */
    WASRELEASED
}

/** Module that manages mouse and touch input. */
export default class MouseModule {

    private engine: Engine;
    private mouseElement: HTMLElement;
    private mousePos = Vect.zero;
    private mouseOffTrk = Vect.zero;    //Potential new mouse offset being tracked
    private mouseOffOld = Vect.zero;    //Previous mouse offset
    private mouseOffLrp = Vect.zero;    //Lerp between old and new offset
    private mouseOffNew = Vect.zero;    //Newest mouse offset
    private mouseOffLimit = 100;        //Maximum size where the tracking offset becomes a new offset
    private mouseOffDampStrength = 100; //Strength on the dampening effect on the tracking offset
    private mouseOffCount = 0;
    private mousePressed = false;
    private afterPressed = false;
    private _mouseType = "";
    private resolution = Vect.zero;

    public get pos() { return this.mousePos.get; }
    public get off() { return this.mouseOffLrp.getMult(1 / this.mouseOffLimit); }
    
    /** Mouse state */
    public get mouseState(): MouseState {

        if (this.mousePressed && !this.afterPressed) {          // If mouse is pressed and afterPressed is different

            return MouseState.WASPRESSED;                       // Mouse was pressed this frame
        } 
        else if (this.mousePressed) {                           // If mouse is pressed and afterPressed is same

            return MouseState.ISPRESSED;                        // Mouse is currently pressed
        } 
        else if (!this.mousePressed && this.afterPressed) {     // If mouse is released and afterPressed is different

            return MouseState.WASRELEASED;                      // Mouse was released this frame
        } 
        else {                                                  // If mouse is released and afterPressed is same

            return MouseState.ISRELEASED;                       // Mouse is currently released
        }
    }

    /** Mouse type */
    public get mouseType(): string {

        return this._mouseType;
    }

    /** Constructor */
    constructor(engine : Engine, element: HTMLElement) {
        
        this.engine = engine;
        this.mouseElement = element;
        this.mouseElement.style.touchAction = 'none';

        this.mouseElement.onpointermove = e => {
            this.updatePos(e);
        }
        this.mouseElement.onpointerdown = e => {
            this.mousePressed = true;
            this.updatePos(e, false);   // On touch devices, we also need to make sure we register this as a change in cursor position
        }
        this.mouseElement.onpointerup = () => this.mousePressed = false;
        this.mouseElement.onpointercancel = () => this.mousePressed = false;
        this.mouseElement.onpointerleave = () => this.mousePressed = false;
    }

    /** Update the mouse for a frame (Should be the last action of a frame) */
    public update(dt: number) {

        //Dampen
        this.mouseOffTrk.sub(this.mouseOffTrk.norm.getMult(dt * this.mouseOffDampStrength));

        //Lerp from old to new mouse Vel
        this.mouseOffCount =    //Track timing for lerp
            this.mouseOffCount > 0 ? 
            this.mouseOffCount - dt * 4 : 
            0;
        this.mouseOffLrp =      //Calculate lerp
            this.mouseOffNew.getMult(1 - this.mouseOffCount).getAdd(
            this.mouseOffOld.getMult(this.mouseOffCount));

        // After a press or release, switch from WAS-state to IS-state
        this.afterPressed = this.mousePressed;
    }

    /** Update the mouse position */
    private updatePos(e: PointerEvent, doUpdateOffset : boolean = true) {

        let prev = this.mousePos.get;

        // Prevent scroll events
        e.preventDefault();
        this._mouseType = e.pointerType;
        this.mousePos.set(
            e.offsetX * (this.resolution.x / (e.target as HTMLElement).clientWidth),
            e.offsetY * (this.resolution.y / (e.target as HTMLElement).clientHeight));

        //Handle mouse offset update if enabled and not currently lerping
        if (doUpdateOffset && this.mouseOffCount == 0) {
            
            //If the new mouse velocity reaches a threshold, replace the old one and reset for a new velocity.
            let diff = this.mousePos.getSub(prev);

            //Ignore horiziontal difference if drag is 1D.
            if(this.engine.settings.getBoolean("touchDragIs1D")) {
                diff.x = 0;
            }

            //Track and update mouse offset
            this.mouseOffTrk.add(diff);
            if(this.mouseOffTrk.magnitudeSquared > Math.pow(this.mouseOffLimit, 2)) {

                this.mouseOffOld = this.mouseOffNew.get;
                this.mouseOffNew = this.mouseOffTrk.norm.getMult(this.mouseOffLimit);
                this.mouseOffTrk.setToZero();
                this.mouseOffCount = 1;
            }
        }
    }

    /** Sets the mouse offset to a fixed direction */
    public setMouseOffset(direction : Vect | number) {

        let newOffset = 
            direction instanceof Vect ?
            direction.norm.getMult(this.mouseOffLimit) :
            new Vect(0, Math.sign(direction) * this.mouseOffLimit);
        
        this.mouseOffTrk = Vect.zero;
        this.mouseOffOld = Vect.zero;
        this.mouseOffLrp = Vect.zero;
        this.mouseOffNew = newOffset.get;
        this.mouseOffCount = 1;
    }

    /** Sets the mouse cursor from a URL */
    public setCursorURL(url?: string) {

        this.mouseElement.style.cursor = "url(" + url + "), auto";
    }

    /** Sets the resolution off the mouse space */
    public setResolution(resx: number, resy: number): void {

        this.resolution.set(resx, resy);
    }
}
