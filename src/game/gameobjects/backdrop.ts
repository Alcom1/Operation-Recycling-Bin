import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { Point } from "engine/utilities/vect";

/** Backdrop parameters */
interface Decal {
    position: Point;
    name: string;
    image: HTMLImageElement;
}

interface SpriteOffset extends Point {
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

    /** Constructor */
    constructor(params: BackdropParams) {
        super(params);

        this.decals = (params.decals ?? [])
            .map(d => ({ 
                name : d.name, 
                position : d.position,
                image : this.engine.library.getImage("bg_" + d.name)}));

        this.type = params.type;
    }

    /** Initialize brick sprite */
    public init() {

        this.image.src = this.engine.baker.bake(ctx => this.drawBackdrop(ctx));
    }


    /** */
    public draw(ctx: CanvasRenderingContext2D) {        
        ctx.drawImage(this.image, 0, 0);
    }

    /** Draw this Backdrop, squares, rivets, then decals */
    public drawBackdrop(ctx: CanvasRenderingContext2D): void {

        ctx.save();
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
                ctx.fillRect(352,  50, 278, 236);
                ctx.fillRect(392, 320, 236, 234);
                ctx.fillRect(660, 242, 278, 236);
                ctx.fillRect(660, 516, 236, 234);
                this.drawRivetSquare(ctx, 372,  66, 5, 5);
                this.drawRivetSquare(ctx, 412, 340, 4, 5);
                this.drawRivetSquare(ctx, 680, 258, 5, 5);
                this.drawRivetSquare(ctx, 682, 534, 4, 5);
                this.drawRivetLine(ctx,  26, 150,  3);
                this.drawRivetLine(ctx, 212,  54,  4, false);
                this.drawRivetLine(ctx,  26, 246,  8, false);
                this.drawRivetLine(ctx,  88, 246,  5);
                this.drawRivetLine(ctx,  88, 582,  5);
                this.drawRivetLine(ctx,  26, 774,  6);
                this.drawRivetLine(ctx, 398, 582,  5, false);
                this.drawRivetLine(ctx, 398, 294,  1);
                this.drawRivetLine(ctx, 460, 726,  4);
                this.drawRivetLine(ctx, 646, 438,  1);
                this.drawRivetLine(ctx, 708, 486,  1);
                this.drawRivetLine(ctx, 956,  54,  2);
                this.drawRivetLine(ctx, 708,  54,  4, false);
                this.drawRivetLine(ctx, 770, 102,  3);
                this.drawRivetLine(ctx, 956, 102, 15, false);
                break;

            case 3:
                ctx.fillRect( 44, 138, 278, 236);
                ctx.fillRect(374,  36, 236, 340);
                ctx.fillRect(512, 420, 278, 236);
                this.drawRivetSquare(ctx, 398,  12, 4, 8);
                this.drawRivetSquare(ctx,  60, 158, 5, 5);
                this.drawRivetSquare(ctx, 532, 440, 5, 5);
                this.drawRivetLine(ctx, 274,  54,  2, false);
                this.drawRivetLine(ctx,  26, 150,  1);
                this.drawRivetLine(ctx, 336, 102,  1);
                this.drawRivetLine(ctx,  26, 582,  4);
                this.drawRivetLine(ctx, 274, 390,  10, false);
                this.drawRivetLine(ctx, 336, 678,  4, false);
                this.drawRivetLine(ctx, 396, 678,  4, false);
                this.drawRivetLine(ctx, 336, 390,  12);
                this.drawRivetLine(ctx, 460, 438,  9, false);
                this.drawRivetLine(ctx, 584, 678,  4, false);
                this.drawRivetLine(ctx, 708, 678,  4, false);
                this.drawRivetLine(ctx, 646, 102,  3);
                this.drawRivetLine(ctx, 832,  54,  7, false);
                this.drawRivetLine(ctx, 956, 438,  9, false);
                break;

            case 4:
                ctx.fillRect( 20,  78, 114, 236);
                ctx.fillRect(350, 408, 278, 236);
                ctx.fillRect(684, 408, 376, 236);
                ctx.fillRect(834,  36, 226, 74);
                this.drawRivetSquare(ctx, -18,  96, 3, 5);
                this.drawRivetSquare(ctx, 366, 428, 5, 5);
                this.drawRivetSquare(ctx, 712, 428, 7, 5);
                this.drawRivetSquare(ctx, 856,  40, 4, 2);
                this.drawRivetLine(ctx,  26,  54,  1);
                this.drawRivetLine(ctx, 150, 246,  1);
                this.drawRivetLine(ctx, 212,  54,  8, false);
                this.drawRivetLine(ctx,  26, 486,  8, false);
                this.drawRivetLine(ctx, 150, 486,  8, false);
                this.drawRivetLine(ctx,  26, 438,  6);
                this.drawRivetLine(ctx, 212, 630,  3);
                this.drawRivetLine(ctx, 584,  54,  8, false);
                this.drawRivetLine(ctx, 646, 150,  7);
                this.drawRivetLine(ctx, 956, 198,  5, false);
                this.drawRivetLine(ctx, 646, 438,  1);
                this.drawRivetLine(ctx, 646, 630,  1);
                this.drawRivetLine(ctx, 708, 678,  4, false);
                this.drawRivetLine(ctx, 956, 678,  2);
                this.drawRivetLine(ctx, 956, 726,  3, false);
                break;

            case 5:
                ctx.fillRect( 20,  36, 528, 226);
                ctx.fillRect(350, 408, 278, 236);
                ctx.fillRect(930,  36, 130, 226);
                this.drawRivetSquare(ctx,  38,  46, 9, 5);
                this.drawRivetSquare(ctx, 366, 428, 5, 5);
                this.drawRivetSquare(ctx, 948,  46, 3, 5);
                this.drawRivetLine(ctx, 144, 286, 12, false);
                this.drawRivetLine(ctx,  82, 574,  1);
                this.drawRivetLine(ctx, 206, 478,  3);
                this.drawRivetLine(ctx, 578,  94,  6);
                this.drawRivetLine(ctx, 578,  94,  6);
                this.drawRivetLine(ctx, 454, 670,  4, false);
                this.drawRivetLine(ctx, 516, 286,  3, false);
                this.drawRivetLine(ctx, 578, 334,  8);
                this.drawRivetLine(ctx, 888, 382,  4, false);
                this.drawRivetLine(ctx, 640, 574,  7);
                this.drawRivetLine(ctx, 950, 622,  5, false);
                break;
        }

        ctx.restore();

        this.decals.forEach(d => ctx.drawImage(d.image, d.position.x, d.position.y));
    }

    /** Draw a line of rivets*/
    private drawRivetLine(
        ctx: CanvasRenderingContext2D, 
        x: number,
        y: number,
        c: number,
        isHorz : boolean = true): void {

        ctx.save();
        ctx.translate(x, y);

        // Each rivet
        for(let i = 0; i < c; i++) {

            this.drawRivet(
                ctx, 
                isHorz ? i * 62 : 0, 
                isHorz ? 0 : i * 48, 
                "#5A6363",
                "#7F8887");
        }

        ctx.restore();
    }

    /** Draw a hollow square of rivets*/
    private drawRivetSquare(
        ctx: CanvasRenderingContext2D, 
        x: number,
        y: number,
        w: number,
        h: number): void {

        ctx.save();
        ctx.translate(x, y);

        // Each row
        for(let j = 0; j < h; j++) {

            // Each column
            for(let i = 0; i < w; i++) {

                // Skip inner hollow area
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

        ctx.restore();
    }

    /** Draw a single rivet */
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