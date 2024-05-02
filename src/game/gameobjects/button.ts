import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import { MouseState } from "engine/modules/mouse";
import { colorAdd, colorMult, colorTranslate, colPointRect, Z_DEPTH, WIDTH_SIDEPANEL } from "engine/utilities/math";
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
    isFocus?: boolean;
}

export default class Button extends GameObject {

    
    /** If button is pressed */
    private press = false;
    /** If button is hovered over */
    private hover = false;
    
    /** Button size */
    private size: Vect;
    /** Button z-axis depth */
    private depth: number;

    /** Button default color */
    private bgColor: string;
    /** Button default shaded color */
    private bgColorDark: string;
    /** Button default light color */
    private bgColorBright: string;

    /** Button hover color */
    private bhColor: string;
    /** Button hover shaded color */
    private bhColorDark: string;
    /** Button hover light color */
    private bhColorBright: string;

    /** Button font */
    private font: string;
    /** Button color */
    private color: string;
    /** Button text */
    protected text: string;

    /** If this button is horizontally centered around the UI */
    private isCenterUI: boolean;

    /** If this button has focus decor */
    private isFocus: boolean;

    /** Images for various button states */
    private images = new Map<boolean, Map<boolean, HTMLImageElement>>([[false, new Map()], [true, new Map()]]);

    /** Constructor */
    constructor(params: ButtonParams) {
        super(params);
        
        // Set default color
        this.bgColor = colorTranslate(params.backgroundColor ?? "#DDDDDD");
        this.bgColorDark = colorMult(this.bgColor, 0.75);
        this.bgColorBright = colorAdd(this.bgColor, 48);

        // Set hover color
        this.bhColor = colorTranslate(params.hoverColor || "#DDDD00");
        this.bhColorDark = colorMult(this.bhColor, 0.75);
        this.bhColorBright = colorAdd(this.bhColor, 48);

        // Set size & depth
        this.size = new Vect(params.size?.x ?? 0, params.size?.y ?? 0);
        this.depth = params.depth || Z_DEPTH / 4;

        // Set style
        this.font = params.font ?? "16px Font04b_08";
        this.color = params.color ?? "#333333";
        this.text = params.text ?? "";

        // Set special position
        this.isCenterUI = !!params.isCenterUI;

        // Set button focus decoration
        this.isFocus = !!params.isFocus;

        // Bake buttons
        // Bake press & unpress
        for (const press of [false, true]) {

            // Back hover & not-hover
            for (const hover of [false, true]) {

                const img = new Image();

                img.src = this.engine.baker.bake(
                    ctx => this.drawButton(ctx, press, hover),
                    this.size.x + this.depth + 100,   
                    this.size.y + this.depth + 100,   
                    `BUTTON.${this.text}.${press ? "PRESS" : "UNPRS"}.${hover ? "HOVER" : "OUTSD"}.${this.isFocus ? "FOCUS" : "UNFOC"}`            
                );

                this.images.get(press)?.set(hover, img);
            }
        }
    }

    /** Initialize this button */
    public init(ctx: CanvasRenderingContext2D) {
        
        // Center button horizontally around the sidepanel UI
        if (this.isCenterUI) {
            this.spos.x = ctx.canvas.width - WIDTH_SIDEPANEL / 2;
        }
    }

    /** Update this button to match current cursor position & state */
    public update(dt: number): void {

        let pos = this.engine.mouse.pos;   // Get mouse position
        
        // Set hover if the cursor is inside the button area
        this.hover = colPointRect(
            pos.x,                              // Cursor x-pos
            pos.y,                              // Cursor y-pos
            this.spos.x - this.size.x / 2,      // Button x-corner
            this.spos.y - this.size.y / 2,      // Button y-corner
            this.size.x + this.depth,           // Button width with depth compensation
            this.size.y + this.depth            // Button height with depth compensation
        );
        
        // If mouse cursor is hovering over this button
        if (this.hover) {

            // Mouse states
            // Get mouse state for different cursor-button events
            switch(this.engine.mouse.mouseState) {

                case MouseState.ISRELEASED:
                    this.press = false;         // NONE state
                    break;

                case MouseState.WASPRESSED:
                    this.press = true;          // PRESS state
                    break;

                case MouseState.WASRELEASED :
                    if (this.press) {
                        this.doButtonAction();  // Do the button's action
                        this.press = false;     // Return to NONE state
                    }
                    break;
            }

        } 
        // If mouse cursor outside this button
        else {

            // Go from pressed state to none state if cursor is released outside the button
            if (this.press && this.engine.mouse.mouseState == MouseState.ISRELEASED) {

                this.press = false;             // NONE state
            }
        }
    }

    /** Draw the current image for this button */
    public draw(ctx: CanvasRenderingContext2D): void {

        ctx.drawImage(
            this.images.get(this.press)?.get(this.hover)!,
            -this.size.x / 2, 
            -this.size.y / 2
        );
    }

    /** Default button action */
    protected doButtonAction(): void {

        console.log(this.text);
    }

    /* Button draw */
    private drawButton(ctx: CanvasRenderingContext2D, press: boolean, hover: boolean): void {

        // Handle button depth
        let currentDepth = press ? this.depth / 2 : this.depth; // Depth for pressed or unpressed state
        let shadowDepth = currentDepth * 1.2;
        ctx.translate(this.depth - currentDepth, currentDepth); // Translate by depth

        // Button shadow color
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)"

        // Draw button shadow
        ctx.beginPath();
        ctx.moveTo(12 - shadowDepth, this.size.y);
        ctx.lineTo(12              , this.size.y + shadowDepth);
        ctx.lineTo(this.size.x + shadowDepth * 2, shadowDepth + this.size.y);
        ctx.lineTo(this.size.x + shadowDepth * 2, shadowDepth - currentDepth);
        ctx.lineTo(this.size.x + currentDepth,                - currentDepth);
        ctx.fill();

        // Button top face color
        ctx.fillStyle = hover ? this.bhColorBright : this.bgColorBright;

        // Draw button top face
        ctx.beginPath();
        ctx.moveTo(0,                          0);              // Lower Right
        ctx.lineTo(              currentDepth, -currentDepth);  // Upper Right
        ctx.lineTo(this.size.x + currentDepth, -currentDepth);  // Upper Left
        ctx.lineTo(this.size.x,                0);              // Lower Left
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

        // Focus decor, non-hover only
        if(this.isFocus) {

            // Focus decor color
            ctx.strokeStyle = hover ? this.bhColorDark : this.bgColorDark;
            ctx.lineWidth = 2;
            ctx.strokeRect(4, 4, this.size.x - 8, this.size.y - 8);
        }

        // Draw button text
        let fontSize = Number(this.font.split("px ")[0]);
        ctx.textAlign = "center";       // Center horizontal
        ctx.font = this.font;           // Font
        ctx.fillStyle = this.color;     // Color
        ctx.fillText(
            this.text,                  // Fill button text
            this.size.x / 2 + (fontSize - 16) / 16, 
            this.size.y / 2 + fontSize * 4.7 / 16
        );
    }
}