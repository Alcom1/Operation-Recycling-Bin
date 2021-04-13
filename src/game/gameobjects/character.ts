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

            //Mask of colliding elements
            let c = this.brickHandler.checkCollisionSuper(
                this.gpos.getSub(new Vect(this.move.x > 0 ? 1 : 0, this.size.y)),
                this.size.y,
                2 * (this.size.y + 2),
                this.size.y + 2,
                this.move.x);

            var qq = ""

            for(let i = 0; i < 8; i++) {
                if(c & 1 << i) {
                    qq += i + " ";
                }
            }

            console.log(qq);

            //WALL - REVERSE
            if(c & 0b00011000) {
                this.move.x *= -1;
                this.gpos.x += this.move.x;
            }
            //HEAD-WALL - REVERSE
            else if(c & 0b01000011 && c & 0b00000100) {
                this.move.x *= -1;
                this.gpos.x += this.move.x;
            }
            //UP-STEP - GO UP
            else if(c & 0b00100000) {
                this.gpos.y -= 1;
            }
            //FLOOR - DO NOTHING
            else if(c & 0b01000001) {

            }
            //DOWN-STEP - GO DOWN
            else if(c & 0b10000010) {
                this.gpos.y += 1;
            }
            //VOID - REVERSE
            else {
                this.move.x *= -1;
                this.gpos.x += this.move.x;
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
        
        ctx.fillStyle = this.move.x > 0 ? "#FF0" : "#00F"
        ctx.fillRect(
           -GMULTX, 
            GMULTY, 
            this.size.x * GMULTX, 
           -this.size.y * GMULTY);
    }
}
