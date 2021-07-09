import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { floor, getZIndex, GMULTX, GMULTY, OPPOSITE_DIRS, round, Z_DEPTH } from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import { CharacterImage, CharacterParams } from "./character";

export interface SpriteCharacterParams extends CharacterParams {
    order : number;
    width? : number;
}

/** Single image gameobject */
export default class SpriteCharacter extends GameObject {

    //Set in constructor
    private order : number;
    private width? : number;
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
    public direction: number = 1;

    constructor(engine : Engine, params : SpriteCharacterParams) {
        super(engine, params);

        this.order = params.order;
        this.width = params.width;
        this.speed = params.speed ?? 1;

        OPPOSITE_DIRS.forEach(d => {
            const index = Math.max(d, 0);
            this.images[d] = {
                image : this.engine.library.getImage(
                    params.images[index].name, 
                    params.images[index].extension),
                offset : params.images[index].offset
            }
        });

        this.animFrames = params.animFrames;
        this.animCount = params.animCount;

        this.setZIndex();
    }

    public init(ctx : CanvasRenderingContext2D) {

        //Wait for init, images are guaranteed loaded by then
        this.animWidth = this.images[1].image.width / this.animFrames;
        this.animHeight = this.images[1].image.height;
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

    public draw(ctx : CanvasRenderingContext2D) {

        const width = this.width ?? 0;
        const image = this.images[this.direction];

        ctx.translate(-this.spos.x, 0);

        ctx.drawImage(
            //Greater image
            image.image,                    //Use different sprites based on travelling direction
            
            //Slice position & size
            width * this.order +            //Move slice forward based on which segment this is.
            image.offset +                  //Use different offsets based on travelling direction  
            floor((                         //Move slice forward to the current animation and current frame
                this.animTrack +            //Move slice forward to the current animation
                Math.min(                   //Get current frame based on the timer and speed of the character
                    this.timer *    
                    this.speed,     
                    1 - Number.EPSILON)) *  //Subtract epsilon to prevent grabbing the next frame at max value
                this.animWidth *            
                this.animFrames /           
                this.animCount,             
                this.animWidth),            //Floor by frame-widths
            0,  
            width,  
            this.animHeight,    

            //Greater image position & size
            width * (this.order - 1),       //Move slice forward based on which segment this is.
            GMULTY - this.animHeight,
            width,
            this.animHeight);

        // ctx.globalAlpha = 0.5;
        // ctx.strokeStyle = "#F00"
        // ctx.lineWidth = 4;
        // ctx.strokeRect(
        //     width * (this.order - 1), 
        //     GMULTY, 
        //     width, 
        //    -this.animHeight);
    }
}