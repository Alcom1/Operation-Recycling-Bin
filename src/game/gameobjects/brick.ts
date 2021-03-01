import GameObject, {GameObjectParams} from "engine/gameobjects/gameobject";
import Engine from "engine/engine";
import { pathImg, colorTranslate, colorMult, colorAdd, GMULTY, Z_DEPTH, GMULTX, BOUNDARY, round, UNDER_CURSOR_Z_INDEX, STUD_RADIUS } from "engine/utilities/math";
import Vect, {Point} from "engine/utilities/vect";
import Scene from "engine/scene/scene";
import BrickStud from "./brickstud";

interface BrickParams extends GameObjectParams {
    color?: string;
    width?: number;
}

export default class Brick extends GameObject {
    /** The color of this brick */
    private color: string;
    /** The shaded color of this brick */
    private colorDark: string;
    /** The bright color of this brick */
    private colorBright: string;
    /** If this is a grey brick */
    public isGrey: boolean;

    /** Baked image data for this brick */
    private image = new Image();

    /** Brick segments (Left, Middle, Right) */
    private brickSprites: Map<string, HTMLImageElement>;

    /** If the image for this brick has been baked */
    public isBaked = false;

    /** If this is a static brick that will never move (grey or blocked by grey bricks), calculated later */
    public isStatic = false;

    /** Width of this brick */
    public width: number;

    /** If this brick is pressed */
    public isPressed = false;

    /** If this brick is selected */
    public isSelected = false;

    /** If this brick is snapped to a position */
    private isSnapped = false;

    /** Relative selected position */
    private selectedPos = new Vect(0, 0);

    /** Temporary recursion state */
    public isGrounded = false;

    /** Temporary recursion state */
    public isChecked = false;

    /** The stud objects for this brick */
    public studs: BrickStud[] = [];

    /** Boundary offset for minimum carried position */
    private minCarry = new Vect(0, 0);

    /** Boundary offset for maximum carried position */
    private maxCarry = new Vect(0, 0);

    constructor(protected engine: Engine, params: BrickParams) {
        super(engine, params);
        
        this.color = colorTranslate(params.color);
        this.colorDark = colorMult(this.color, 0.625);
        this.colorBright = colorAdd(this.color, 48);
        this.isGrey = !params.color;

        this.width = params.width || 1;
        // Z-sort vertically and then horizontally.
        this.zIndex =
            // 2x multiplier for stud overlap
            (this.gpos.x * 2)
            // Y-pos has priority over X-pos.
            - (this.gpos.y * 100)
            // 2x width added for stud overlap
            + (this.width * 2);

        // Generate studs across the width of this brick
        // For each width unit of this brick
        for (let i = 0; i < this.width; i++) {
            const stud = new BrickStud(this.engine, {
                ...params,
                // Stud has a different position than its parent brick
                position: {
                    // Studs go across the brick
                    x : this.gpos.x + i,
                    // Studs are above the brick
                    y : this.gpos.y - 1
                }
            });
            this.studs.push(stud);

            // Add stud game objects to scene
            this.parent.pushGO(stud);
        }

        this.brickSprites = new Map<string, HTMLImageElement>([
            ["l", new Image()],
            ["m", new Image()],
            ["r", new Image()]
        ]);

        this.brickSprites.forEach((v, k) => v.src = pathImg(`brick_${k}_${this.color.replace("#", "")}`));
    }

    public update(dt: number): void {

        //If images are loaded and brick hasn't been baked yet
        if(
            !this.isBaked &&
            Array.from(this.brickSprites.values()).every(i => i.complete))
        {
            //Bake image of brick
            this.image.src = this.engine.baker.bake(
                ctx => this.drawBrick(ctx),
                // Width to contain the brick, the right face, and the border
                this.width * GMULTX + Z_DEPTH + 3,
                // Height to contain the brick, the top face, and the border
                GMULTY + Z_DEPTH + 3,
                `BRICK.${this.width}.${this.color}`
            );

            this.isBaked = true;
        }

        // Follow mouse if selected
        if (this.isSelected) {
            this.setToCursor();
        }
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        // Global transparency for selection states
        ctx.globalAlpha =
            this.isSnapped ? 0.75 : // Snapped bricks are transparent
            this.isSelected ? 0.5 : // Selected bricks are more transparent
            this.isPressed ? 0.75 : // Pressed bricks are less transparent again
            1.0;                    // Otherwise opaque if not selected or pressed
        
        // Draw with vertical offset for top face
        ctx.drawImage(this.image, 0, -Z_DEPTH - 3);
    }

    /** Set the brick to match the cursor position, based on its stored selected position */
    public setToCursor(): void {
        // Position based difference between stored selected position and new cursor position
        // Brick position is its position relative to the cursor
        this.spos = this.engine.mouse.getPos().getSub(this.selectedPos).getClamp({
            // Clamp above minimum-x position
            x: (BOUNDARY.minx - this.minCarry.x) * GMULTX,
            // Clamp above minimum-y position
            y: (BOUNDARY.miny - this.minCarry.y) * GMULTY
        }, {  
            // Clamp below maximum-x position
            x: (BOUNDARY.maxx - this.maxCarry.x) * GMULTX,
            // Clamp below maximum-y position
            y: (BOUNDARY.maxy - this.maxCarry.y) * GMULTY
        });    

        // Grid positioning
        if (this.isSnapped) {
            this.spos.set({
                x : round(this.spos.x, GMULTX),
                y : round(this.spos.y, GMULTY)
            });
        }

        // Set studs to match the position of this brick while selected.
        this.resetStuds();
    }

    // Setup this brick for pressing
    public press(): void {
        // Can't press static bricks
        if (!this.isStatic) {
            this.isPressed = true;
            // Press studs for transparency
            this.studs.forEach(s => s.press());
        }
    }

    /** Setup this brick for selecting */
    public select(pos: Point): void {
        this.isSelected = true;
        // Check so this brick is ignored for float checks
        this.isChecked = true;
        // Store mouse's current position for relative calculations later
        this.selectedPos.set(pos);
        // Set z-index to draw this brick under the cursor
        this.zIndex = UNDER_CURSOR_Z_INDEX;
        // Select studs for transparency
        this.studs.forEach(s => s.select());
    }

    /** Clear this brick's selection states */
    public deselect(): void {
        // Restore grid position for deselection
        if (this.isSelected) {
            // Snap sub position to the grid for the new position
            this.gpos.set(
                this.gpos.x + Math.round(this.spos.x / GMULTX),
                this.gpos.y + Math.round(this.spos.y / GMULTY)
            );
        }

        // Restore states & values
        this.isPressed = false;
        this.isSelected = false;
        this.isSnapped = false;
        this.spos.set(0, 0);
        this.selectedPos.set(0, 0);
        this.zIndex = this.gpos.x * 2 - this.gpos.y * 100 + this.width * 2;
        // Reset studs to match the final brick position
        this.resetStuds();
        this.studs.forEach(s => s.deselect());
    }

    // Set this brick's snap state
    public snap(state: boolean): void {
        this.studs.forEach(s => s.snap(state));

        // Snap or unsnap based on the given state
        if (state) {
            this.isSnapped = true;
            this.zIndex =
                // 2x multiplier for stud overlap
                ((this.gpos.x + Math.round(this.spos.x / GMULTX)) * 2)
                // Y-pos has priority over X-pos.
                - ((this.gpos.y + Math.round(this.spos.y / GMULTY)) * 100)
                // 2x width added for stud overlap
                + (this.width * 2);
        } else {
            this.isSnapped = false;
            // Set Z-index for dragging
            this.zIndex = UNDER_CURSOR_Z_INDEX;
            // Reposition for unsnapped state to fix 1-frame jump on pickup
            this.setToCursor();
        }
    }

    /** Clear this brick's recursion states */
    public clearRecursion() {
        this.isGrounded = false;
        this.isChecked = false;
    }

    /** Reset studs to match the position of this brick */
    private resetStuds(): void {
        for (const [idx, stud] of this.studs.entries()) {
            // Set stud global pos to match this brick
            stud.gpos.set(this.gpos.x + idx, this.gpos.y - 1);
            // Set stud sub pos to match this brick
            stud.spos.set(this.spos);
        }
    }

    /** Set the minimum and maximum carry positions of this brick */
    public setMinMax(min: Vect, max: Vect): void {
        this.minCarry = min;
        this.maxCarry = max;
    }

    /** Draw this brick */
    private drawBrick(ctx: CanvasRenderingContext2D): void {

        ctx.save();

        //Draw left side
        ctx.drawImage(this.brickSprites.get("l")!!, 0, 0);
        ctx.translate(30, 0);

        //Draw middle segments
        for (let j = 1; j < this.width; j++) {
            ctx.drawImage(this.brickSprites.get("m")!!, 0, 0);
            ctx.translate(30, 0);
        }

        //Draw right side
        ctx.drawImage(this.brickSprites.get("r")!!, 0, 0);
        ctx.restore();

        // Grey holes
        if (this.isGrey) {

            //Set style for grey holes
            ctx.strokeStyle = this.colorDark;
            ctx.lineWidth = 2;

            // All holes share the same Y-offset
            const yoff = Math.ceil(GMULTY * 1.1);

            // Hole styles
            ctx.fillStyle = this.colorDark;

            // Draw hole for each brick width, except for the last one
            for (let j = 1; j < this.width; j++) {
                // X-offset increases for each hole
                const xoff = GMULTX * j;

                // Hole border
                ctx.beginPath();
                ctx.arc(xoff, yoff, STUD_RADIUS, 0, 2 * Math.PI);
                ctx.stroke();

                // Hole center
                ctx.beginPath();
                ctx.arc(xoff, yoff, STUD_RADIUS * 0.64, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
}