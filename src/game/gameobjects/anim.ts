import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { floor, getZIndex, GMULTX, GMULTY, OPPOSITE_DIRS, zip } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";

export interface OffsetImageParams {
    name : string;
    extension? : string;
    offsetX? : number;
}

export interface OffsetImage {
    image : HTMLImageElement;
    offsetX : number;
}

export interface AnimationParams extends GameObjectParams {
    images : OffsetImageParams[];
    speed? : number;
    isLoop? : boolean;
    isVert? : boolean;
    framesSize? : number;
    gposOffset? : Point;
    zModifier? : number;

    frameCount : number;
    animsCount? : number;
    sliceIndex? : number;
}

/** Animated image gameobject */
export default class Anim extends GameObject {

    //Set in constructor
    private gposOffset : Point;                     //Constant offset of the global position
    private zModifier : number;                     //Modifier value added to the zIndex
    private images : OffsetImage[] = [];            //Animation images with a horizontal offset
    private speed : number;                         //Speed of the animation
    public  isLoop : boolean;                       //If this animation is looped
    private isVert : boolean;                       //If this animation is arranged vertically
    private framesSize? : number;                   //The Horizontal/Vertical size of each frame
    private frameCount : number;                    //The Quantity of frames for this animation
    private animsCount : number;                    //The number of animations per image
    private sliceIndex? : number;                   //The index of this animation, if it's been sliced

    //Set in init
    private fullSize : Point = { x : 0, y : 0 };    //The full dimensions of this animation's images

    //Set here
    public  zModifierPub : number = 0;              //Public z-modifier
    public  isVisible : boolean = true;             //If this animation is visible
    private timer : number = 0;                     //Timer to track frames
    private imageIndex: number = 0;                 //Index of the current image
    private animsIndex : number = 0;                //Index of the current animation
    private sposYFix : number = -101;               //Z-index offset to fix vertical clipping

    //get
    public get duration() : number { return 1 / this.speed; }

    constructor(params : AnimationParams) {
        super(params);

        this.speed = params.speed ?? 1;
        this.isLoop = params.isLoop ?? true;
        this.isVert = params.isVert ?? false;
        this.framesSize = params.framesSize;
        this.gposOffset = params.gposOffset ?? { x : 0, y : 0 }
        this.zModifier = (params.zModifier ?? 300) + (this.spos.y > 0 ? this.sposYFix : 0);

        switch(params.images.length) {

            //No images (why?)
            case 0:
                break;

            //Single images
            case 1:
                this.images[0] = this.getImage(params.images[0]);
                break;
            
            //Pair of images with opposing directions
            case 2:
                this.imageIndex = 1;
                OPPOSITE_DIRS.forEach(d => {
                    const index = Math.max(d, 0);
                    if(params.images[index]) {
                        this.images[d] = this.getImage(params.images[index]);
                    }
                });
                break;

            //Many images, use zipper indicies (-1, 1, -2, 2...)
            default:
                this.imageIndex = 1;
                params.images.forEach((x, i) => {
                    this.images[zip(i)] = this.getImage(x);
                });
        }

        this.frameCount = params.frameCount;
        this.animsCount = params.animsCount ?? 1;
        this.sliceIndex = params.sliceIndex;
    }

    //Retrieve an image from the library
    private getImage(params : OffsetImageParams) : OffsetImage {

        return {
            image : this.engine.library.getImage(
                params.name, 
                params.extension),
            offsetX : params.offsetX ?? 0
        }
    }

    //Init is called after images are retrieved. 
    public init(ctx : CanvasRenderingContext2D) {

        this.fullSize = {
            x : this.images[this.imageIndex].image.width,
            y : this.images[this.imageIndex].image.height
        }

        //Default frame size based on the image size and number of frames
        if(!this.framesSize) {
            this.framesSize = (this.isVert ? this.fullSize.y : this.fullSize.x) * this.animsCount / this.frameCount
        }
    }

    //Update and track timer for this animation
    public update(dt: number) {

        //For all moving animations
        if(this.speed > 0) {

            //Increment timer by delta-time
            this.timer += dt;
    
            if(this.isLoop && this.timer > 1 / this.speed) {

                this.timer -= 1 / this.speed;   //May cause frame skipping
            }
        }
    }

    //Reset timer, update position, and switch current animation.
    public reset(gpos? : Vect, isTimerReset : boolean = true) {

        //Reset gpos if available
        if(gpos) { 
            this.gpos = gpos.getAdd(this.gposOffset); 
        }

        //Reset timer
        if(isTimerReset) {
            this.timer = 0;
            this.animsIndex = ++this.animsIndex % this.animsCount;
        }
    }

    //Get z-index for draw sorting
    public getGOZIndex() : number {

        return getZIndex(
            this.gpos,
            this.zModifier + 
            this.zModifierPub + (
            this.spos.y > 0 ? this.sposYFix : 0 ))    //Fix clipping while moving upwards
    }

    //Set the image index, swapping the image for this animation.
    public setImageIndex(index : number) {

        //This animation has many images
        if(this.images[index]) {
            this.imageIndex = index;
        }
        //This animation has 2 images
        else if(this.images[Math.sign(index)]) {
            this.imageIndex = Math.sign(index);
        }
        //This animation has 1 image
        else if(this.images[0]) {
            this.imageIndex = 0;
        }
    }

    //Draw this animation
    public draw(ctx : CanvasRenderingContext2D) {

        //Stop if this animation is not visible
        if(!this.isVisible) {
            return;
        }

        const size = this.framesSize ?? 0;                                  //Size (horizontal or vertical) of this frame
        const image = this.images[this.imageIndex];                         //Current image
        const widthSlice = size * (this.sliceIndex ?? 0);                   //Slice width, or 0 if this animation isn't sliced
        const oppoSize = this.isVert ? this.fullSize.x : this.fullSize.y;   //Full width or height (the non-animated direction)

        ctx.drawImage(
            //Greater image
            image.image,                    

            //Slice position & size 
            widthSlice +                    //Move segment forward based on which slice this is.
            image.offsetX +                 //Move segment forward based on the X-offset of the current image  
            this.getAnimationOffset(false),
            this.getAnimationOffset(true),  
            this.isVert ? oppoSize : size,  
            this.isVert ? size : oppoSize,    

            //Greater image position & size
            widthSlice,                     //Move segment forward based on which slice this is. Unused(?) for vertical animations.
            this.isVert ? 0 : GMULTY - this.fullSize.y,
            this.isVert ? oppoSize : size,  
            this.isVert ? size : oppoSize);

        // ctx.globalAlpha = 0.5;
        // ctx.strokeStyle = "#F00"
        // ctx.lineWidth = 4;
        // ctx.strokeRect(
        //     widthSlice, 
        //     this.isVert ? 0 : GMULTY, 
        //     this.isVert ? oppoSize : size, 
        //     this.isVert ? size : -oppoSize);
    }

    private getAnimationOffset(checkVert : boolean) : number {

        //If the animation direction matches the checked direction, return an animation offset, 0 otherwise.
        if(checkVert == this.isVert) {

            const fullSize = this.isVert ? this.fullSize.y : this.fullSize.x;

            return floor((                  //Move segment forward to the current animation and current frame
                this.animsIndex +           //Move segment forward to the current animation
                Math.min(                   //Get current frame based on the timer and speed of the animation
                    this.timer *        
                    this.speed,         
                    1 - Number.EPSILON)) *  //Subtract epsilon to prevent grabbing the next frame at max value
                fullSize / this.animsCount,             
                fullSize / this.frameCount)
        }
        else {
            return 0;
        }
    }
}