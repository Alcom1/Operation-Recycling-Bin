import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { getZIndex, GMULTX, GMULTY, round, Z_DEPTH } from "engine/utilities/math";
import Vect from "engine/utilities/vect";
import { CharacterImage, CharacterParams } from "./character";

export interface SpriteCharacterParams extends CharacterParams {
    order : number;
}

/** Single image gameobject */
export default class SpriteCharacter extends GameObject {

    //Set in constructor
    private order : number;
    private speed : number;
    private imageRight : CharacterImage;
    private imageLeft : CharacterImage;
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
        this.speed = params.speed ?? 1;
        
        this.imageRight = {
            image : this.engine.library.getImage(
                params.imageRight.name, 
                params.imageRight.extension),
            offset : params.imageRight.offset
        };

        this.imageLeft = {
            image : this.engine.library.getImage(
                params.imageLeft.name, 
                params.imageLeft.extension),
            offset : params.imageLeft.offset
        };

        this.animFrames = params.animFrames;
        this.animCount = params.animCount;

        this.setZIndex();
    }

    public init(ctx : CanvasRenderingContext2D) {

        //Wait for init, images are guaranteed loaded by then
        this.animWidth = this.imageRight.image.width / this.animFrames;
        this.animHeight = this.imageRight.image.height;
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

        ctx.translate(-this.spos.x, 0);

        ctx.drawImage(
            this.direction > 0 ? this.imageRight.image : this.imageLeft.image,
            GMULTX * this.order + (this.direction > 0 ? this.imageRight.offset : this.imageLeft.offset) +
            round((
                this.animTrack +
                this.timer * 
                this.speed) * 
                this.animWidth * 
                this.animFrames / 
                this.animCount - 

                this.animWidth / 2,

                this.animWidth),
            0,
            GMULTX,
            this.animHeight, 

            GMULTX * (this.order - 1),
            GMULTY - this.animHeight,
            GMULTX,
            this.animHeight);

        // ctx.globalAlpha = 0.5;
        // ctx.strokeStyle = "#F00"
        // ctx.lineWidth = 4;
        // ctx.strokeRect(
        //     GMULTX * (this.order - 1), 
        //     GMULTY, 
        //     GMULTX, 
        //    -this.animHeight);
    }
}