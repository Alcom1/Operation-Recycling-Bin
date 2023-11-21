import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { Point } from "engine/utilities/vect";

/** Backdrop parameters */
interface Decal {
    position: Point;
    name: string;
}

export interface BackdropParams extends GameObjectParams {
    decals : Decal[];
    type : number;
}

/** Single image gameobject */
export default class Backdrop extends GameObject {
    
    private image : HTMLImageElement = new Image();
    private decals : Decal[];
    private type : number;

    /** Initialize brick sprite */
    public init() {

        this.image.src = this.engine.baker.bake(ctx => this.drawBackdrop(ctx));
    }

    /** Constructor */
    constructor(params: BackdropParams) {
        super(params);

        this.decals = params.decals ?? [];
        this.type = params.type;

        this.decals.forEach(d => console.log(d.name, d.position.x, d.position.y));
    }

    /** */
    public draw(ctx: CanvasRenderingContext2D) {        
        ctx.drawImage(this.image, 0, 0);
    }

    /** Draw this Backdrop */
    public drawBackdrop(ctx: CanvasRenderingContext2D): void {

        ctx.fillStyle = "#636B6B";

        ctx.translate(0, 24);

        switch(this.type) {
            case 0:
            case 1:
                ctx.fillRect( 20,  78, 226, 236);
                ctx.fillRect(324,  78, 348, 236);
                ctx.fillRect(128, 428, 240, 236);
                ctx.fillRect(820, 384, 240, 236);
                ctx.fillRect(884, 668, 176, 172);
                this.drawRivetSquare(ctx, -24,  98, 5, 5);
                this.drawRivetSquare(ctx, 346,  98, 6, 5);
                this.drawRivetSquare(ctx, 158, 446, 4, 5);
                this.drawRivetSquare(ctx, 842, 406, 5, 5);
                this.drawRivetSquare(ctx, 916, 698, 4, 5);
                this.drawRivetLine(ctx, 398,  54,  1);
                this.drawRivetLine(ctx, 708, 102,  6);
                this.drawRivetLine(ctx, 278,  98,  1);
                this.drawRivetLine(ctx, 278, 194,  1);
                this.drawRivetLine(ctx, 522, 342, 11, false);
                this.drawRivetLine(ctx, 646, 342,  8, false);
                this.drawRivetLine(ctx, 212, 342,  2, false);
                this.drawRivetLine(ctx,  26, 534,  7, false);
                this.drawRivetLine(ctx, 274, 678,  4, false);
                this.drawRivetLine(ctx,  88, 774,  3);
                this.drawRivetLine(ctx, 584, 726,  4);
                this.drawRivetLine(ctx, 832, 726,  3, false);
                this.drawRivetLine(ctx, 398, 486,  2);
                this.drawRivetLine(ctx, 708, 438,  2);
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                break;
            case 5:
                break;
        }

        ctx.translate(0, -24);

        ctx.fillStyle = "#444";
        this.decals.forEach(d => ctx.fillRect(d.position.x * 2, d.position.y * 2, 10, 10));
    }

    /** */
    private drawRivetLine(
        ctx: CanvasRenderingContext2D, 
        x: number,
        y: number,
        c: number,
        isHorz : boolean = true): void {

        ctx.translate(x, y);

        for(let i = 0; i < c; i++) {

            this.drawRivet(
                ctx, 
                isHorz ? i * 62 : 0, 
                isHorz ? 0 : i * 48, 
                "#5A6363",
                "#7F8887");
        }

        ctx.translate(-x, -y);
    }

    /** */
    private drawRivetSquare(
        ctx: CanvasRenderingContext2D, 
        x: number,
        y: number,
        w: number,
        h: number): void {

        ctx.translate(x, y);

        for(let j = 0; j < h; j++) {

            for(let i = 0; i < w; i++) {

                if(!(j == 0 || j == h - 1) && !(i == 0 || i == w - 1)) {
                    continue;
                }

                this.drawRivet(
                    ctx, 
                    i * 60, 
                    j * 48, 
                    "#535C5C",
                    "#6B7373");
            }
        }

        ctx.translate(-x, -y);
    }

    /** */
    private drawRivet(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        color1: string,
        color2: string) {

        ctx.fillStyle = color1;
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, 6, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = color2;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }
}