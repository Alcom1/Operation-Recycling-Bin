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

/** Module that manages mouse movement and stateTouches. **/
export default class MouseModule {
    private mouseElement: HTMLElement;
    private mousePos = Vect.zero;
    private mouseVelNew = Vect.zero;
    private mouseVelOld = Vect.zero;
    private mouseVelLimit = 40;
    private mouseVelDampStrength = 10;
    private mousePressed = false;
    private afterPressed = false;
    private mouseType = "";
    private resolution = Vect.zero;

    public get pos() { return this.mousePos.get(); }
    public get vel() { return this.mouseVelOld.getNorm(); }

    /** Constructor */
    constructor(element: HTMLElement) {
        this.mouseElement = element;
        this.mouseElement.style.touchAction = 'none';

        this.mouseElement.onpointermove = e => this.updatePos(e);
        this.mouseElement.onpointerdown = e => {
            this.mousePressed = true;
            // On touch devices, we also need to make sure we register this as a change in cursor position
            this.updatePos(e);
        }
        this.mouseElement.onpointerup = () => this.mousePressed = false;
        this.mouseElement.onpointercancel = () => this.mousePressed = false;
        this.mouseElement.onpointerleave = () => this.mousePressed = false;
    }

    /** Update the mouse for a frame (Should be the last action of a frame) */
    public update(dt: number) {

        //Dampen
        this.mouseVelNew.sub(this.mouseVelNew.getNorm().getMult(dt * this.mouseVelDampStrength));

        // After a press or release, switch from WAS-state to IS-state
        this.afterPressed = this.mousePressed;
    }

    /** Update the mouse position */
    private updatePos(e: PointerEvent) {

        let prev = this.mousePos.get();

        // Prevent scroll events
        e.preventDefault();
        this.mouseType = e.pointerType;
        this.mousePos.set(
            e.offsetX * (this.resolution.x / (e.target as HTMLElement).clientWidth),
            e.offsetY * (this.resolution.y / (e.target as HTMLElement).clientHeight)
        );

        //If the new mouse velocity reaches a threshold, replace the old one and reset for a new velocity.
        let diff = this.mousePos.getSub(prev).getNorm();
        this.mouseVelNew.add(diff);
        if(this.mouseVelNew.getMagnitudeSquared() > Math.pow(this.mouseVelLimit, 2)) {
            this.mouseVelOld = this.mouseVelNew.get();
            this.mouseVelNew.setToZero();
        }
    }

    /** Mouse state */
    public getMouseState(): MouseState {
        if (this.mousePressed && !this.afterPressed) {          // If mouse is pressed and afterPressed is different
            return MouseState.WASPRESSED;                       // Mouse was pressed this frame
        } else if (this.mousePressed) {                         // If mouse is pressed and afterPressed is same
            return MouseState.ISPRESSED;                        // Mouse is currently pressed
        } else if (!this.mousePressed && this.afterPressed) {   // If mouse is released and afterPressed is different
            return MouseState.WASRELEASED;                      // Mouse was released this frame
        } else {                                                // If mouse is released and afterPressed is same
            return MouseState.ISRELEASED;                       // Mouse is currently released
        }
    }

    /** Mouse type */
    public getMouseType(): string {
        return this.mouseType;
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
