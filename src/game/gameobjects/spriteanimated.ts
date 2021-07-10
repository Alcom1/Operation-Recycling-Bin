import Engine from "engine/engine";
import GameObject from "engine/gameobjects/gameobject";
import { floor, getZIndex, GMULTY, OPPOSITE_DIRS } from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import { CharacterImage, CharacterImageParams, CharacterParams } from "./character";

export interface SpriteAnimatedParams extends CharacterParams {
    order : number;
    width? : number;
    offset : number;
}

/** Single image gameobject */
export default class SpriteAnimated extends GameObject {

    //Set in constructor
    private order : number;
    private width? : number;
    private offset : number;
    private speed : number;
    private images : CharacterImage[] = [];
    private animFrames : number;
    private animCount : number;

    //Set in init
    private animWidth : number = 0;
    private animHeight : number = 0;

    //Set here
    private animTrack : number = 0;
    private timer : number = 0;
    private index: number = 1;

    constructor(engine : Engine, params : SpriteAnimatedParams) {
        super(engine, params);

        this.order = params.order;
        this.width = params.width;
        this.offset = params.offset;
        this.speed = params.speed ?? 1;

        switch(params.images.length){

            //No images (why?)
            case 0:
                break;

            //Single images
            case 1:
                this.index = 0;
                this.images[0] = this.getCharacterImage(params.images[0]);
            
            //Pair of images with opposing directions
            case 2:
                OPPOSITE_DIRS.forEach(d => {
                    const index = Math.max(d, 0);
                    if(params.images[index]) {
                        this.images[d] = this.getCharacterImage(params.images[index]);
                    }
                });

            //Many images
            default:
                params.images.forEach(i => this.images.push(this.getCharacterImage(i)));
        }

        this.animFrames = params.animFrames;
        this.animCount = params.animCount;

        this.setZIndex();
    }

    private getCharacterImage(params : CharacterImageParams) : CharacterImage {
        return {
            image : this.engine.library.getImage(
                params.name, 
                params.extension),
            offset : params.offset ?? 0
        }
    }

    public init(ctx : CanvasRenderingContext2D) {

        //Wait for init, images are guaranteed loaded by then
        this.animWidth = this.images[this.index].image.width / this.animFrames;
        this.animHeight = this.images[this.index].image.height;
    }

    public update(dt: number) {

        //Increment timer by delta-time
        this.timer += dt;
    }

    public updateSprite(gpos : Vect) {

        this.timer = 0;
        this.gpos = gpos;
        this.animTrack = ++this.animTrack % this.animCount;
        this.setZIndex();
    }

    private setZIndex() {
        this.zIndex = getZIndex(
            this.gpos,
            300 - (this.order < 2 ? 0 : 295));
    }

    public setImageIndex(index : number) {
        this.index = index;
    }

    public draw(ctx : CanvasRenderingContext2D) {

        const width = this.width ?? 0;
        const image = this.images[this.index];

        ctx.drawImage(
            //Greater image
            image.image,                        //Use different sprites based on travelling direction

            //Slice position & size 
            width * this.order +                //Move slice forward based on which segment this is.
            image.offset +                      //Use different offsets based on travelling direction  
            floor((                             //Move slice forward to the current animation and current frame
                this.animTrack +                //Move slice forward to the current animation
                Math.min(                       //Get current frame based on the timer and speed of the character
                    this.timer *        
                    this.speed,         
                    1 - Number.EPSILON)) *      //Subtract epsilon to prevent grabbing the next frame at max value
                this.animWidth *                
                this.animFrames /               
                this.animCount,                 
                this.animWidth),                //Floor by frame-widths
            0,  
            width,  
            this.animHeight,    

            //Greater image position & size
            width * this.order + this.offset,   //Move slice forward based on which segment this is and its offset
            GMULTY - this.animHeight,
            width,
            this.animHeight);

        // ctx.globalAlpha = 0.5;
        // ctx.strokeStyle = "#F00"
        // ctx.lineWidth = 4;
        // ctx.strokeRect(
        //     width * this.order + this.offset, 
        //     GMULTY, 
        //     width, 
        //    -this.animHeight);
    }
}