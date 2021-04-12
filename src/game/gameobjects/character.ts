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

            //Block value - number that indicates the existence and position of a blocking elements
            let block = this.getCollsion();

            //Walls
            if (this.gpos.x - 1 < BOUNDARY.minx ||          //Left-level border
                this.gpos.x + 1 > BOUNDARY.maxx || (        //Right level border
                block > 0 && block < this.size.y - 1)) {    //Normal wall

                console.log("MOVE - WALL");
                this.move.x *= -1;
                this.gpos.x += this.move.x;
            }
            //Other states
            else {
                
                switch (block) {

                    //No bricks - go back
                    case -1:
                        console.log("MOVE - CLIFF");
                        this.move.x *= -1;
                        break;

                    //Head brick - check for down stair
                    case 0:
                        console.log("MOVE - HEADBLOCK");
                        this.move.x *= -1;
                        break;

                    //Up-step brick - step upwards
                    case this.size.y - 1:
                        console.log("MOVE - UP");
                        this.gpos.y -= 1;
                        break;

                    //Floor brick - continue forward
                    case this.size.y:
                        console.log("MOVE");
                        break;
                    
                    //Down-step - step downwards
                    case this.size.y + 1:
                        console.log("MOVE - DOWN");
                        this.gpos.y += 1;
                        break;
                }
            }
        
            //Do not check collisions until the next step
            this.checkCollision = false;
        }
    }

    /** Check collision and return the block-value */
    private getCollsion(): number {

        //For the current and next column
        for(let xOffset = 0; Math.abs(xOffset) <= 1; xOffset += this.move.x) {

            //Check if there
            var block = this.brickHandler.checkCollision(
                this.gpos.getAdd(
                    new Vect(
                        (this.move.x < 0 ? -1 : 0) + xOffset, 
                        1 - this.size.y)),
                this.size.y + 2)

            //If there is a blocking element return a block-value
            if(block >= 0) {
                return block * (Math.abs(xOffset) + 1)
            }
        }

        return -1;
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
