import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { floor, getZIndex, GMULTY, OPPOSITE_DIRS } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";

export interface OffsetImageExpandedParams {
    name : string;
    extension : string;
    offsetX : number;
}

export interface OffsetImageParams {
    name : string;
    extension? : string;
    offsetX : number;
}

export interface OffsetImage {
    image : HTMLImageElement;
    offsetX : number;
}

export interface AnimationParams extends GameObjectParams {

    images : OffsetImageParams[];
    speed? : number;
    loop? : boolean;
    framesSize? : number;
    gposOffset? : Point;

    frameCount : number;
    animsCount? : number;
    sliceIndex? : number;
}

/** Animated image gameobject */
export default class Animat extends GameObject {

    //Set in constructor
    private gposOffset : Point;
    private images : OffsetImage[] = [];
    private speed : number;
    private loop : boolean;
    private framesSize? : number;
    private frameCount : number;
    private animsCount : number;
    private sliceIndex? : number;

    //Set in init
    private fullSize : Point = { x : 0, y : 0 };

    //Set here
    private timer : number = 0;
    private imageIndex: number = 0;
    private animsIndex : number = 0;

    constructor(engine : Engine, params : AnimationParams) {
        super(engine, params);

        this.speed = params.speed ?? 1;
        this.loop = params.loop ?? true;
        this.framesSize = params.framesSize;
        this.gposOffset = params.gposOffset ?? { x : 0, y : 0 }

        switch(params.images.length){

            //No images (why?)
            case 0:
                break;

            //Single images
            case 1:
                this.images[0] = this.getImage(params.images[0]);
            
            //Pair of images with opposing directions
            case 2:
                this.imageIndex = 1;
                OPPOSITE_DIRS.forEach(d => {
                    const index = Math.max(d, 0);
                    if(params.images[index]) {
                        this.images[d] = this.getImage(params.images[index]);
                    }
                });

            //Many images
            default:
                params.images.forEach(i => this.images.push(this.getImage(i)));
        }

        this.frameCount = params.frameCount;
        this.animsCount = params.animsCount ?? 1;
        this.sliceIndex = params.sliceIndex;


        this.setZIndex();
    }

    private getImage(params : OffsetImageParams) : OffsetImage {
        return {
            image : this.engine.library.getImage(
                params.name, 
                params.extension),
            offsetX : params.offsetX ?? 0
        }
    }

    public init(ctx : CanvasRenderingContext2D) {

        this.fullSize = {
            x : this.images[this.imageIndex].image.width,
            y : this.images[this.imageIndex].image.height
        }
    }

    public update(dt: number) {

        //For all moving animations
        if(this.speed > 0) {

            //Increment timer by delta-time
            this.timer += dt;
    
            if(this.loop && this.timer > 1 / this.speed) {
                this.timer = 0;
            }
        }
    }

    public updateSprite(gpos : Vect) {

        this.timer = 0;
        this.gpos = gpos.getAdd(this.gposOffset);
        this.animsIndex = ++this.animsIndex % this.animsCount;
        this.setZIndex();
    }

    private setZIndex() {
        
        this.zIndex = getZIndex(
            this.gpos,
            310 - ((this.sliceIndex ?? 1) < 1 ? 0 : 295))   //Magic Z-index handling
    }

    public setImageIndex(index : number) {
        this.imageIndex = index;
    }

    public draw(ctx : CanvasRenderingContext2D) {

        const width = this.framesSize ?? 0;
        const image = this.images[this.imageIndex];
        const widthSlice = width * (this.sliceIndex ?? 0);

        ctx.drawImage(
            //Greater image
            image.image,                    

            //Slice position & size 
            widthSlice +                    //Move segment forward based on which slice this is.
            image.offsetX +                 //Move segment forward based on the X-offset of the current image  
            floor((                         //Move segment forward to the current animation and current frame
                this.animsIndex +           //Move segment forward to the current animation
                Math.min(                   //Get current frame based on the timer and speed of the animation
                    this.timer *        
                    this.speed,         
                    1 - Number.EPSILON)) *  //Subtract epsilon to prevent grabbing the next frame at max value
                this.fullSize.x / this.animsCount,             
                this.fullSize.x / this.frameCount),
            0,  
            width,  
            this.fullSize.y,    

            //Greater image position & size
            widthSlice,                     //Move segment forward based on which slice this is
            GMULTY - this.fullSize.y,
            width,
            this.fullSize.y);

        // ctx.globalAlpha = 0.5;
        // ctx.strokeStyle = "#F00"
        // ctx.lineWidth = 4;
        // ctx.strokeRect(
        //     width * this.sliceIndex, 
        //     GMULTY, 
        //     width, 
        //    -this.fullSize.y);
    }
}