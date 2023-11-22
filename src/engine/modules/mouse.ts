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
    private mousePos = new Vect(0, 0);
    private mousePressed = false;
    private afterPressed = false;
    private mouseType = "";
    private resolution = new Vect(0, 0);

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
    public update() {
        // After a press or release, switch from WAS-state to IS-state
        this.afterPressed = this.mousePressed;
    }

    /** Update the mouse position */
    private updatePos(e: PointerEvent) {

        // Prevent scroll events
        e.preventDefault();
        this.mouseType = e.pointerType;
        this.mousePos = new Vect(
            e.offsetX * (this.resolution.x / (e.target as HTMLElement).clientWidth),
            e.offsetY * (this.resolution.y / (e.target as HTMLElement).clientHeight)
        );
    }

    /** Mouse position */
    public getPos(): Vect {
        return this.mousePos;
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
        this.resolution = new Vect(resx, resy);
    }
}
