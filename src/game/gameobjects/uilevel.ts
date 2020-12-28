import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import { BOUNDARY, colorAdd, colorMult, colorTranslate, GMULTX, GMULTY, LINE_WIDTH, Z_DEPTH } from "engine/utilities/math";

export default class UILevel extends GameObject {
    private color: string;
    private colorDark: string;
    private colorBright: string;

    private colorCeiling: string;
    private colorCeilingDark: string;
    private colorCeilingBright: string;

    private logoColor: string = '#747474';

    private image = new Image();

    constructor(engine: Engine, params: GameObjectParams) {
        super(engine, params);

        this.color = colorTranslate();
        this.colorDark = colorMult(this.color, 0.625)
        this.colorBright = colorAdd(this.color, 48);

        this.colorCeiling = colorTranslate('black');
        this.colorCeilingDark = colorMult(this.colorCeiling, 0.625);
        this.colorCeilingBright = colorAdd(this.colorCeiling, 48);

        this.image.src = this.engine.baker.bake(ctx => this.drawBackground(ctx));
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.image, 0, 0);
    }

    /** Draw the level UI background */
    private drawBackground(ctx: CanvasRenderingContext2D): void {
        // Draw sidebar
        ctx.save();
        this.drawSidebar(ctx);
        ctx.restore();

        // Draw ceiling
        ctx.save();
        this.drawCeiling(ctx);
        ctx.restore();

        // Draw logo
        ctx.save();
        this.drawLogo(ctx);
        ctx.restore();
    }

    /** Draw the sidebar menu */
    private drawSidebar(ctx: CanvasRenderingContext2D): void {
        // Main UI color
        ctx.fillStyle = this.color;

        // UI side rect
        ctx.beginPath();
        ctx.fillRect(
                                GMULTX * (BOUNDARY.maxx) + Z_DEPTH / 2,     // xpos
                                GMULTY,                                     // ypos
            ctx.canvas.width -  GMULTX * (BOUNDARY.maxx),                   // width
            ctx.canvas.height - GMULTY                                      // height
        );

        // Translate for lower brick
        ctx.translate(
            GMULTX * BOUNDARY.maxx,                                         // Translate-x
            GMULTY * (BOUNDARY.maxy - 1));                                  // Translate-y

        // Lower brick front face
        ctx.fillRect(                                                       // Rectangle for front face
            0,                                                              // Origin
            0,                                                              // Origin
            GMULTX * 9,                                                     // Brick width
            GMULTY                                                          // Brick height
        );

        // Top face style
        ctx.fillStyle = this.colorBright;

        // Top face
        ctx.beginPath();
        ctx.moveTo(0,                       0);                             // Lower left corner
        ctx.lineTo(Z_DEPTH / 2,  -Z_DEPTH / 2);                             // Upper left corner
        ctx.lineTo(ctx.canvas.width,        -Z_DEPTH);                      // Upper right corner
        ctx.lineTo(ctx.canvas.width,        0);                             // Lower right corner
        ctx.fill(); 

        // UI Border style   
        ctx.strokeStyle = this.colorBright;                                 // Stroke dark color
        ctx.lineWidth = LINE_WIDTH;                                         // Line width
        ctx.lineCap = "square";                                             // Square corners

        // Light plate border color
        ctx.strokeStyle = this.colorBright;

        // Light plate border
        ctx.beginPath();
        ctx.moveTo(LINE_WIDTH * 1.5, GMULTY / 3);                           // Border start
        ctx.lineTo(ctx.canvas.width, GMULTY / 3);                           // Border end
        ctx.stroke();

        // Dark plate border color
        ctx.strokeStyle = this.colorDark;

        // Dark plate border
        ctx.beginPath();
        ctx.moveTo(LINE_WIDTH,       GMULTY / 3 - LINE_WIDTH / 2);          // Left pseudo-pixel
        ctx.lineTo(LINE_WIDTH * 1.5, GMULTY / 3 - LINE_WIDTH);              // Border start
        ctx.lineTo(ctx.canvas.width, GMULTY / 3 - LINE_WIDTH);              // Border end
        ctx.stroke();

        // Border
        ctx.beginPath();
        ctx.moveTo(Z_DEPTH    / 2,   -GMULTY * (BOUNDARY.maxy - 3) - Z_DEPTH / 2);      // Upper right border far
        ctx.lineTo(Z_DEPTH    / 2,                                 - Z_DEPTH / 2);      // Upper left corner (back)                                                                                // Start path
        ctx.lineTo(LINE_WIDTH / 2,   0);                                                // Upper left corner
        ctx.lineTo(LINE_WIDTH / 2,   GMULTY                        - LINE_WIDTH / 2);   // Lower left corner
        ctx.lineTo(ctx.canvas.width, GMULTY                        - LINE_WIDTH / 2);   // Lower right corner
        ctx.stroke();

        // Depth Border color
        ctx.strokeStyle = this.color;

        // Depth Border
        ctx.beginPath();
        ctx.moveTo(Z_DEPTH    / 2,   -Z_DEPTH / 2);   // Upper left corner (back)
        ctx.lineTo(LINE_WIDTH / 2,   0);              // Upper left corner
        ctx.stroke();
    }

    /** Draw the universal ceiling */
    private drawCeiling(ctx: CanvasRenderingContext2D): void {
        // Reset transform to draw from the top-left corner
        var ceilOffsetU = GMULTY / 3 * 4;                   // Upper edge of ceiling
        var ceilOffsetL = GMULTY / 3 * 5;                   // Lower edge of ceiling
        var ceilOffsetB = ceilOffsetU - Z_DEPTH;            // Back edge of ceiling

        // Ceiling front face color
        ctx.fillStyle = this.colorCeiling;

        // Ceiling front face
        ctx.fillRect(
            0,                                                          // xpos
            ceilOffsetU,                                                // ypos
            ctx.canvas.width,                                           // width
            ceilOffsetL - ceilOffsetU                                   // height
        );

        // Ceiling top face color
        ctx.fillStyle = this.colorCeilingBright;

        // Ceiling top face
        ctx.beginPath();
        ctx.moveTo(0,                  ceilOffsetU);                    // Lower left
        ctx.lineTo(Z_DEPTH,            ceilOffsetB);                    // Upper left
        ctx.lineTo(ctx.canvas.width,   ceilOffsetB);                    // Upper right
        ctx.lineTo(ctx.canvas.width,   ceilOffsetU);                    // Lower right
        ctx.fill();

        // Ceiling bottom line color
        ctx.strokeStyle = this.colorCeilingDark;

        // Ceiling bottom line
        ctx.beginPath();
        ctx.moveTo(0,                ceilOffsetL);                      // Left side
        ctx.lineTo(ctx.canvas.width, ceilOffsetL);                      // Right side
        ctx.stroke();

        // Draw ceiling lines across the width of the canvas
        for (let i = LINE_WIDTH / 2; i < ctx.canvas.width;) {
            // Top line color
            ctx.strokeStyle = this.colorCeiling;

            // Top line
            ctx.beginPath();
            ctx.moveTo(i + Z_DEPTH - LINE_WIDTH, ceilOffsetB + LINE_WIDTH);  // Top line upper
            ctx.lineTo(i,                        ceilOffsetU);               // Top line lower
            ctx.stroke();   

            // Front line color  
            ctx.strokeStyle = this.colorCeilingDark;    

            // Front line    
            ctx.beginPath();    
            ctx.moveTo(i, ceilOffsetU + LINE_WIDTH / 2);     // Front line upper
            ctx.lineTo(i, ceilOffsetL);                      // Front line lower
            ctx.stroke();   

            // Increment for set of lines
            i += 4 * GMULTX;
        }

        // Upper UI rect fill and border colors
        ctx.strokeStyle = this.colorCeiling;
 
        // Upper UI rect
        ctx.beginPath();
        ctx.moveTo(Z_DEPTH,           ceilOffsetB + LINE_WIDTH / 2);    // Left side
        ctx.lineTo(ctx.canvas.width,  ceilOffsetB + LINE_WIDTH / 2);    // Right side
        ctx.stroke();
    }

    /** Draw the recyle logo on the sidebar */
    private drawLogo(ctx: CanvasRenderingContext2D): void {
        // Translate to logo center
        ctx.translate(        
            ctx.canvas.width / 2 +
            BOUNDARY.maxx * GMULTX / 2 +
            Z_DEPTH / 4,
            175
        );

        // Draw 4 arrows of logo
        for (let i = 0; i < 4; i++) {

            // Logo color
            ctx.fillStyle = this.logoColor;

            var logoStart = 10; // Starting point of the logo arrow
            var logoWidth = 64; // Width of the logo
            var logoThick = 17; // Thickness of the logo arrows
            var logoPoint = 28; // Depth of the logo arrow points

            // Draw logo arrow
            ctx.beginPath();
            ctx.moveTo(logoStart,             logoWidth - logoThick);   // Bruh do you think SVG would have been better for all of this?
            ctx.lineTo(logoWidth - logoThick, logoWidth - logoThick);   
            ctx.lineTo(logoWidth - logoThick, logoPoint);
            ctx.lineTo(logoWidth / 2,         logoPoint);
            ctx.lineTo(logoWidth,            -logoStart / 2);
            ctx.lineTo(logoWidth / 2 * 3,     logoPoint);
            ctx.lineTo(logoWidth + logoThick, logoPoint);
            ctx.lineTo(logoWidth + logoThick, logoWidth + logoThick);   // Nah
            ctx.lineTo(logoStart,             logoWidth + logoThick);
            ctx.fill();

            // Rotate 90 degrees for the next arrow
            ctx.rotate(Math.PI / 2);
        }
    }
}