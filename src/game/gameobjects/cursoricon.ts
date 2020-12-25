import Engine from "engine/engine";
import GameObject, { GameObjectParams } from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";

export enum CursorIconState {
    NONE,
    DRAG,
    CARRY,
    HOVER,
    HOVERDOWN,
    HOVERUP
}

export default class CursorIcon extends GameObject {
    private cursorURLs: Record<CursorIconState, string>;

    public constructor(engine: Engine, params: GameObjectParams) {
        super(engine, params);
        
        this.cursorURLs = {
            [CursorIconState.NONE]: this.engine.baker.bake(
                ctx => this.drawCursorBase(ctx),
                32, 32,
                "CURSOR.NONE"
            ),
            [CursorIconState.DRAG]: this.engine.baker.bake(
                ctx => {
                    this.drawCursorBase(ctx);
                    this.drawDecalArrowDouble(ctx);
                },
                32, 32,
                "CURSOR.DRAG"
            ),
            [CursorIconState.CARRY]: this.engine.baker.bake(
                ctx => {
                    this.drawCursorBase(ctx);
                    this.drawDecalArrowQuad(ctx);
                },
                32, 32,
                "CURSOR.CARRY"
            ),
            [CursorIconState.HOVER]: this.engine.baker.bake(
                ctx => {
                    this.drawCursorBase(ctx);
                    this.drawDecalArrowDouble(ctx);
                },
                32, 32,
                "CURSOR.INDY"
            ),
            [CursorIconState.HOVERDOWN]: this.engine.baker.bake(
                ctx => {
                    this.drawCursorBase(ctx);
                    this.drawDecalArrowDown(ctx);
                },
                32, 32,
                "CURSOR.DOWN"
            ),
            [CursorIconState.HOVERUP]: this.engine.baker.bake(
                ctx => {
                    this.drawCursorBase(ctx);
                    this.drawDecalArrowUp(ctx);
                },
                32, 32,
                "CURSOR.UP"
            )
        }

        this.setCursor(CursorIconState.NONE);
    }

    /** Sets the cursor to match the provided state */
    public setCursor(state: CursorIconState): void {
        this.engine.mouse.setCursorURL(this.cursorURLs[state]);
    }

    /** Draw base cursor image */
    public drawCursorBase(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "#FFF";                 // Base cursor fill color
        ctx.strokeStyle = "#666";               // Base cursor border color
        ctx.lineWidth = 1.5;                    // Base cursor border width
        ctx.lineJoin = "round";                 // Base cursor line style

        ctx.beginPath();                        // Start path
        ctx.moveTo(1,  1);                      // Top vertex
        ctx.lineTo(1, 11);                      // Lower left vertex
        ctx.lineTo(11, 1);                      // Lower right vertex
        ctx.closePath();                        // Close path
        ctx.fill();                             // Fill cursor
        ctx.stroke();                           // Draw cursor border

        ctx.beginPath();                        // Start path
        ctx.arc(16, 16, 12, 0, 2 * Math.PI);    // Circle for icons
        ctx.closePath();                        // Close path
        ctx.fill();                             // Fill cursor
        ctx.stroke();                           // Draw cursor border
    }

    /** Draw hover decal for cursor */
    public drawDecalArrowDouble(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "#444";                 // Hover decal color
        ctx.translate(16, 16);                  // Translate. Drag decal is drawn around this center.
        ctx.beginPath();                        // Start path

        for(var i = 0; i < 2; i++) {            // Draw two opposing arrows

            ctx.lineTo( 5,  3);                 // Right arrow vertex
            ctx.lineTo( 0,  9);                 // Peak arrow vertex
            ctx.lineTo(-5,  3);                 // Left arrow vertex
        
            ctx.lineTo(-2,  3);                 // Stalk base
            ctx.lineTo(-2, -3);                 // Stalk extended to other side

            ctx.rotate(Math.PI);                // Rotate for second arrow
        }

        ctx.closePath();
        ctx.fill();
    }

    /** Draw hover decal for cursor */
    public drawDecalArrowDown(ctx: CanvasRenderingContext2D): void {
        ctx.translate(16, 17);  // Translate. Drag decal is drawn around this center.

        this.drawDecalArrow(ctx);
    }

    /** Draw hover decal for cursor */
    public drawDecalArrowUp(ctx: CanvasRenderingContext2D): void {
        ctx.translate(16, 15);  // Translate. Drag decal is drawn around this center.
        ctx.rotate(Math.PI);    // Rotate for second arrow

        this.drawDecalArrow(ctx);
    }

    /** Draw a cursor arrow decal */
    public drawDecalArrow(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "#444"; // Arrow decal color

        ctx.beginPath();        // Start path

        ctx.lineTo( 5,  0);     // Right arrow vertex
        ctx.lineTo( 0,  7);     // Peak arrow vertex
        ctx.lineTo(-5,  0);     // Left arrow vertex
    
        ctx.lineTo(-2,  0);     // Stalk base
        ctx.lineTo(-2, -8);     // Stalk extended to other side
        
        ctx.lineTo( 2, -8);     // Stalk extended to other side
        ctx.lineTo( 2,  0);     // Stalk base

        ctx.closePath();
        ctx.fill();
    }

    /** Draw hover decal for cursor */
    public drawDecalArrowQuad(ctx: CanvasRenderingContext2D): void {
        ctx.translate(16, 16);          // Translate. Carry decal is drawn around this center.

        ctx.rotate(Math.PI / 4);        // Rotate 8th circle
        ctx.fillStyle = "#333";         // Outer diamond color
        ctx.fillRect(-6, -6, 12, 12);   // Draw diamond

        ctx.rotate(Math.PI / 4);        // Rotate 8th circle
        ctx.fillStyle = "#FFF";         // Inner square color
        ctx.fillRect(-4.5, -4.5, 9, 9); // Draw square
    }
}