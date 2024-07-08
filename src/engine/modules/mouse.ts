import Engine from "engine/engine";
import Scene from "engine/scene/scene";
import Vect, { Point } from "engine/utilities/vect";
import NoDragArea from "game/gameobjects/nodragarea";

/** Mouse press & release states */
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

    private mouseElement: HTMLElement;
    private mousePos = Vect.zero;
    private mouseOffOld = Vect.zero;    //Previous mouse offset
    private mouseOffLrp = Vect.zero;    //Lerp between old and new offset
    private mouseOffNew = Vect.zero;    //Newest mouse offset
    private mouseOffLimit = 100;        //Maximum size where the tracking offset becomes a new offset
    private mouseOffCount = 0;
    private mousePressed = false;
    private afterPressed = false;
    private _mouseType = "";
    private resolution = Vect.zero;
    private noDragAreas : NoDragArea[] = [];

    public get pos() : Vect { return this.mousePos.get; }
    public get off() : Vect { return this.mouseOffLrp.getMult(1 / this.mouseOffLimit); }
    public get isMaxed() {

        return (
            this.mouseOffNew.y == 0 ||
            Math.abs(this.off.y) == 1);
    }
    
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
    constructor(element: HTMLElement) {
        
        this.mouseElement = element;
        this.mouseElement.style.touchAction = 'none';

        this.mouseElement.onpointermove = e => {
            this.updatePos(e);
        }
        this.mouseElement.onpointerdown = e => {
            this.mousePressed = true;
            this.updatePos(e);   // On touch devices, we also need to make sure we register this as a change in cursor position
        }
        this.mouseElement.onpointerup = () => this.mousePressed = false;
        this.mouseElement.onpointercancel = () => this.mousePressed = false;
        this.mouseElement.onpointerleave = () => this.mousePressed = false;
    }

    /** Update the mouse for a frame (Should be the last action of a frame) */
    public update(dt: number) {

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
    private updatePos(e: PointerEvent) {

        // Prevent scroll events
        e.preventDefault();
        this._mouseType = e.pointerType;

        let newMousePos = Vect.zero;

        // Pointer positioning for fullscreen mode
        if(document.fullscreenElement === e.target) {

            let fullScreenSize = { x : window.innerWidth, y : window.innerHeight };
            let boxingGap = { x : 0, y : 0 };

            //If fullscreen is taller than game resolution, modify y-position.
            if(this.resolution.x / this.resolution.y > fullScreenSize.x / fullScreenSize.y) {
                
                fullScreenSize.y = this.resolution.y / this.resolution.x * fullScreenSize.x;
                boxingGap.y = (window.innerHeight - fullScreenSize.y) / 2;
            }
            //If fullscreen is wider than game resolution, modify x-position.
            else {
                
                fullScreenSize.x = this.resolution.x / this.resolution.y * fullScreenSize.y;
                boxingGap.x = (window.innerWidth - fullScreenSize.x) / 2;
            }

            // Set mouse position
            newMousePos.set(
                (e.offsetX - boxingGap.x) * this.resolution.x / fullScreenSize.x, 
                (e.offsetY - boxingGap.y) * this.resolution.y / fullScreenSize.y);
        }
        // Pointer positioning for normal mode
        else {

            // Set mouse position
            newMousePos.set(
                e.offsetX * (this.resolution.x / (e.target as HTMLElement).clientWidth), 
                e.offsetY * (this.resolution.y / (e.target as HTMLElement).clientHeight));
        }

        let noDrag = false;

        if([MouseState.ISPRESSED, MouseState.WASPRESSED].some(s => s == this.mouseState)) {

            this.noDragAreas.forEach(a => {

                if(a.press(newMousePos, this.mouseState)) {
                    noDrag = true;
                }
            })
        }

        if(!noDrag) {
            
            this.mousePos = newMousePos.get;
        }
    }

    /** Sets the mouse offset to a fixed direction */
    public setMouseOffset(direction : Vect | number) {

        let newOffset = 
            direction instanceof Vect ?
            direction.norm.getMult(this.mouseOffLimit) :
            new Vect(0, Math.sign(direction) * this.mouseOffLimit);
        
        this.mouseOffOld = Vect.zero;
        this.mouseOffLrp = Vect.zero;
        this.mouseOffNew = newOffset.get;
        this.mouseOffCount = 1;
    }

    /** Flips the mouse offset */
    public flipMouseOffset() {
        
        this.setMouseOffset(-Math.sign(this.off.y));
    }

    /** Sets the mouse cursor from a URL */
    public setCursorURL(url?: string) {

        this.mouseElement.style.cursor = "url(" + url + "), auto";
    }

    /** Sets the resolution off the mouse space */
    public setResolution(resx: number, resy: number): void {

        this.resolution.set(resx, resy);
    }

    /** Adds a new no-move area to this mouse */
    public addNoMoveArea(area : NoDragArea) {

        this.noDragAreas.push(area);
    }

    /** Clears all no-move areas */
    public clear(sceneNames: string[]) {

        this.noDragAreas = this.noDragAreas.filter(a => !sceneNames.some(sn => sn === a.parent.name));
    }
}
