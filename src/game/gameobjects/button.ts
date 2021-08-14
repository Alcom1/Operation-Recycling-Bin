import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import {MouseState} from "engine/modules/mouse";
import { BOUNDARY, colorAdd, colorMult, colorTranslate, colPointRect, Z_DEPTH, WIDTH_SIDEPANEL } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";

interface ButtonParams extends GameObjectParams {
    size?: Point;
    depth?: number;
    color?: string;
    backgroundColor?: string;
    hoverColor?: string;
    font?: string;
    text?: string;
    isCenterUI?: boolean;
}

export default class Button extends GameObject {
    private press = false;
    private hover = false;
    
    private size: Vect;
    private depth: number;

    private bgColor: string;
    private bgColorDark: string;
    private bgColorBright: string;
    /** Button hover color */
    private bhColor: string;
    /** Button hover shaded color */
    private bhColorDark: string;
    /** Button hover light color */
    private bhColorBright: string;

    private font: string;
    private color: string;
    protected text: string;

    /* If this button is horizontally centered around the UI */
    private isCenterUI: boolean;

    private images = new Map<boolean, Map<boolean, HTMLImageElement>>([[false, new Map()], [true, new Map()]]);

    constructor(engine: Engine, params: ButtonParams) {
        super(engine, params);
        
        this.bgColor = colorTranslate(params.backgroundColor ?? "#DDDDDD");
        this.bgColorDark = colorMult(this.bgColor, 0.75);
        this.bgColorBright = colorAdd(this.bgColor, 48);

        this.bhColor = colorTranslate(params.hoverColor || "#DDDD00");
        this.bhColorDark = colorMult(this.bhColor, 0.75);
        this.bhColorBright = colorAdd(this.bhColor, 48);

        this.size = new Vect(params.size?.x ?? 0, params.size?.y ?? 0);
        this.depth = params.depth || Z_DEPTH / 4;

        this.font = params.font ?? "16px Font04b_08";
        this.color = params.color ?? "#333333";
        this.text = params.text ?? "";

        this.isCenterUI = !!params.isCenterUI;

        // Bake buttons
        for (const press of [false, true]) {
            for (const hover of [false, true]) {
                const img = new Image();
                img.src = this.engine.baker.bake(
                    ctx => this.drawButton(ctx, press, hover),
                    this.size.x + this.depth,   
                    this.size.y + this.depth,   
                    `BUTTON.${this.text}.${press ? "PRESS" : "UNPRS"}.${hover ? "HOVER" : "OUTSD"}`            
                );
                this.images.get(press)?.set(hover, img);
            }
        }
    }

    public init(ctx: CanvasRenderingContext2D, scenes: Scene[]): void {
        
        // Center button horizontally around the UI
        if (this.isCenterUI) {
            this.spos.x = ctx.canvas.width - WIDTH_SIDEPANEL / 2;
        }
    }

    public update(dt: number): void {
        var pos = this.engine.mouse.getPos();
        
        // Set hover if the cursor is inside the button area
        this.hover = colPointRect(
            pos.x,                              // Cursor x-pos
            pos.y,                              // Cursor y-pos
            this.spos.x - this.size.x / 2,      // Button x-corner
            this.spos.y - this.size.y / 2,      // Button y-corner
            this.size.x + this.depth,           // Button width with depth compensation
            this.size.y + this.depth            // Button height with depth compensation
        );
        
        if (this.hover) {
            // Mouse states
            switch(this.engine.mouse.getMouseState()) {     // Get mouse state for different cursor-buttone events
                case MouseState.ISRELEASED:
                    this.press = false;                     // NONE state
                    break;
                case MouseState.WASPRESSED:
                    this.press = true;                      // PRESS state
                    break;
                case MouseState.WASRELEASED :
                    if (this.press) {
                        this.doButtonAction();              // Do the button's action
                        this.press = false;                 // Return to NONE state
                    }
                    break;
            }
        } else {
            // Go from pressed state to none state if cursor is released outside the button
            if (this.press && this.engine.mouse.getMouseState() == MouseState.ISRELEASED) {
                this.press = false;                         // NONE state
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(
            this.images.get(this.press)?.get(this.hover)!,
            -this.size.x / 2, 
            -this.size.y / 2
        );
    }

    protected doButtonAction(): void {
        console.log(this.text);
    }

    /* Button draw */
    private drawButton(ctx: CanvasRenderingContext2D, press: boolean, hover: boolean): void {
        // Handle button depth
        var currentDepth = press ? this.depth / 2 : this.depth;        // Depth for pressed or unpressed state
        ctx.translate(this.depth - currentDepth, currentDepth);             // Translate by depth

        // Button top face color
        ctx.fillStyle = hover ? this.bhColorBright : this.bgColorBright;

        // Draw button top face
        ctx.beginPath();
        ctx.moveTo(0,                          0);                          // Lower Right
        ctx.lineTo(              currentDepth, -currentDepth);              // Upper Right
        ctx.lineTo(this.size.x + currentDepth, -currentDepth);              // Upper Left
        ctx.lineTo(this.size.x,                0);                          // Lower Left
        ctx.fill();

        // Button right face color
        ctx.fillStyle = hover ? this.bhColorDark : this.bgColorDark;

        // Draw button right face
        ctx.beginPath();
        ctx.moveTo(this.size.x,                0);                          // Upper Left
        ctx.lineTo(this.size.x + currentDepth,             - currentDepth); // Upper Right
        ctx.lineTo(this.size.x + currentDepth, this.size.y - currentDepth); // Lower Left
        ctx.lineTo(this.size.x,                this.size.y);                // Lower Right
        ctx.fill();

        // Button rectangle color
        ctx.fillStyle = hover ? this.bhColor : this.bgColor;

        // Draw button rectangle 
        ctx.fillRect(   
            0,                          // Center vertical
            0,                          // Center horizontal
            this.size.x,                // Button width
            this.size.y                 // Button height
        );

        // Draw button text
        ctx.textBaseline = "middle";    // Center vertical
        ctx.textAlign = "center";       // Center horizontal
        ctx.font = this.font;           // Font
        ctx.fillStyle = this.color;     // Color
        ctx.fillText(
            this.text,                  // Fill button text
            this.size.x / 2, 
            this.size.y / 2
        );
    }
}