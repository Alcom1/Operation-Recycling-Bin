import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { BOUNDARY, GMULTX, GMULTY } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import BrickHandler from "./brickhandler";

interface CharacterParams extends GameObjectParams {
    size?: Point;
    speed?: number;
}

export default class Character extends GameObject {
    private size: Vect;
    private speed: number;
    private text: string = '';
    private move: Vect;
    private brickHandler!: BrickHandler;
    private checkCollision: boolean;

    constructor(engine: Engine, params: CharacterParams) {
        super(engine, params);
        this.size = new Vect(params.size?.x ?? 0, params.size?.y ?? 0);
        this.speed = params.speed ?? 1;
        this.move = new Vect(1, 1);
        this.checkCollision = true;
    }

    public init(ctx: CanvasRenderingContext2D) {
        
        this.brickHandler = this.engine.tag.get("BrickHandler", "LevelInterface")[0] as BrickHandler;
    }

    public update(dt: number) {

        //Increment position by speed
        this.spos.x += this.move.x * this.speed * GMULTX * dt;

        //Step grid position further once subposition goes past a grid-unit
        if (Math.abs(this.spos.x) > GMULTX) {
            var dir = Math.sign(this.spos.x);

            this.spos.x -= GMULTX * dir;
            this.gpos.x += dir;

            this.checkCollision = true;
        }

        if (this.checkCollision) {

            //Collision bitmask
            let cbm = this.brickHandler.checkCollisionSuper(
                this.gpos.getSub(new Vect(this.move.x > 0 ? 1 : 0, this.size.y + 1)),   //Position
                this.size.y + 1,                                                        //Start
                2 * (this.size.y + 3),                                                  //Final
                this.size.y + 3,                                                        //Height
                this.move.x);                                                           //Direction

            // var qq = ""

            // for(let i = 0; i < 8; i++) {
            //     if(c & 1 << i) {
            //         qq += i + " ";
            //     }
            // }

            // console.log(qq);
            
            //WALL BOUNDARY
            if(
                this.gpos.x - 1 < BOUNDARY.minx || 
                this.gpos.x + 1 > BOUNDARY.maxx) {

                this.move.x *= -1;
                this.gpos.x += this.move.x;
            }
            else {

                //WALL - REVERSE
                if(cbm & 0b000110000) {
                    this.move.x *= -1;
                    this.gpos.x += this.move.x;
                }
                //HEAD-WALL - REVERSE
                else if(cbm & 0b000001000 && cbm & 0b010000001) {
                    this.move.x *= -1;
                    this.gpos.x += this.move.x;
                }
                //UP-STEP - GO UP
                else if(cbm & 0b001000000) {

                    //BLOCKED BY HEADBRICK
                    if(cbm & 0b000000100) {
                        this.move.x *= -1;
                        this.gpos.x += this.move.x;
                    }
                    else {
                        this.gpos.y -= 1;
                    }
                }
                //FLOOR - DO NOTHING
                else if(cbm & 0b010000001) {

                }
                //DOWN-STEP - GO DOWN
                else if(cbm & 0b100000010) {
                    this.gpos.y += 1;
                }
                //VOID - REVERSE
                else {
                    this.move.x *= -1;
                    this.gpos.x += this.move.x;
                }
            }
        
            //Do not check collisions until the next step
            this.checkCollision = false;
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {

        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = "#F00"
        ctx.lineWidth = 4;
        ctx.strokeRect(
           -GMULTX, 
            GMULTY, 
            this.size.x * GMULTX, 
           -this.size.y * GMULTY);

        ctx.translate(-this.spos.x, 0);
        
        ctx.fillStyle = "#FF0"
        ctx.beginPath();
        ctx.moveTo(-GMULTX * this.size.x / 2, GMULTY);
        ctx.lineTo(-GMULTX * this.size.x / 2, GMULTY - this.size.y * GMULTY + (this.move.x < 0 ? 1 : 0) * GMULTY);
        ctx.lineTo(                        0, GMULTY - this.size.y * GMULTY);
        ctx.lineTo( GMULTX * this.size.x / 2, GMULTY - this.size.y * GMULTY + (this.move.x > 0 ? 1 : 0) * GMULTY);
        ctx.lineTo( GMULTX * this.size.x / 2, GMULTY);
        ctx.fill();
    }
}
