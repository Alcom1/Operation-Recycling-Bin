import Engine from "engine/engine";
import Scene from "engine/scene/scene";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { BOUNDARY, getZIndex, GMULTX, GMULTY, round } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import BrickHandler from "./brickhandler";
import Brick from "./brick";
import Cursor from "./cursor";

export interface CharacterParams extends GameObjectParams {
    speed? : number;
    imageRight : CharacterImageParams;
    imageLeft : CharacterImageParams;
    animFrames : number;
    animCount : number;
}

export interface CharacterImageParams {
    name : string;
    extension : string;
    offset : number;
}

export interface CharacterImage {
    image : HTMLImageElement;
    offset : number;
}

export default class Character extends GameObject {

    private level!: Scene;
    private speed: number;
    protected _height: number;
    public get height() { return this._height; }
    protected move: Vect;
    protected brickHandler!: BrickHandler;
    private underBricks: Brick[] = [];
    private cursor!: Cursor;
    protected checkCollision: boolean;

    protected imageRight : CharacterImage;
    protected imageLeft : CharacterImage;
    protected animFrames : number;
    protected animWidth : number = 0;
    protected animHeight : number = 0;
    protected animCount : number;
    protected animTrack : number = 0;
    protected timer : number = 0;

    constructor(engine: Engine, params: CharacterParams) {
        super(engine, params);
        
        this.speed = params.speed ?? 1; //Default speed
        this.move = new Vect(1, 0);     //Default move directions
        this._height = 2;               //Default height for a character
        this.checkCollision = true;

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
    }

    public init(ctx: CanvasRenderingContext2D, scenes: Scene[]) {

        // Get level.
        const level = scenes.find(s => s.name == "Level");
        if (!level) throw new Error("Can't find level");
        this.level = level;

        // Get brickhandler for pressure checks
        this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0] as BrickHandler;

        //Wait for init, images are guaranteed loaded by then
        this.animWidth = this.imageRight.image.width / this.animFrames;
        this.animHeight = this.imageRight.image.height;
    }

    public update(dt: number) {

        //Increment timer by delta-time
        this.timer += dt;

        //Increment position by speed
        this.spos.x += this.move.x * this.speed * GMULTX * dt;

        //Step grid position further once subposition goes past a grid-unit
        if (Math.abs(this.spos.x) > GMULTX) {
            this.timer = 0;

            var dir = Math.sign(this.spos.x);

            this.spos.x -= GMULTX * dir;
            this.gpos.x += dir;

            this.zIndex = getZIndex(this.gpos, 2);
            this.level.sortGO();

            this.checkCollision = true;

            this.animTrack = ++this.animTrack % this.animCount 
        }

        //Check collision
        if(this.checkCollision) {

            this.handleCollision();
            this.handleBricks();

            this.checkCollision = false;
        }
    }

    private handleBricks() {

        this.underBricks.forEach(b => b.pressure -= 1);

        this.underBricks = this.brickHandler.checkCollisionRow(
            this.gpos.getAdd({x : -1, y : 1}), 
            2);

        this.underBricks.forEach(b => b.pressure += 1);
        this.brickHandler.isPressured = true;
    }

    protected handleCollision() {

    }

    protected reverse() {
        this.move.x *= -1;
        this.gpos.x += this.move.x;
    }

    public draw(ctx: CanvasRenderingContext2D) {

        // console.dir(this.imageRight);
        // debugger;

        ctx.translate(-this.spos.x, 0);

        ctx.drawImage(
            this.move.x > 0 ? this.imageRight.image : this.imageLeft.image,
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
            this.animWidth,
            this.animHeight, 

           -GMULTX - (this.move.x > 0 ? this.imageRight.offset : this.imageLeft.offset),
            GMULTY - this.animHeight,
            this.animWidth,
            this.animHeight);

        // ctx.globalAlpha = 0.5;
        // ctx.strokeStyle = "#F00"
        // ctx.lineWidth = 4;
        // ctx.strokeRect(
        //     -GMULTX, 
        //     GMULTY, 
        //     GMULTX * 2, 
        //     GMULTY * -4);
    }
}
