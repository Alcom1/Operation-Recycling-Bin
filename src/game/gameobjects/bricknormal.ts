import { col1D, GMULTX, GMULTY, Z_DEPTH } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";
import Brick, { BrickParams } from "./brick";
import Stud from "./stud";

export default class BrickNormal extends Brick {

    /** The stud objects for this brick */
    private studs: Stud[] = [];
    
    /** Brick segments (Left, Middle, Right) */
    private brickSprites: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();

    /** Char keys for each brick sprite */
    private brickSpriteKeys: Map<string, Boolean> = new Map<string, Boolean>([
        ["l", false],
        ["m", false],
        ["r", false],
        ["h", true]
    ]);

    constructor(params: BrickParams) {
        super(params);

        // Spawn studs across the width of this brick
        // For each width unit of this brick
        for (let i = 0; i < this.width; i++) {
            const stud = new Stud({
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
        
        //Get image for each brick sprite key
        this.brickSpriteKeys.forEach((needsGrey, spriteKey) => {
            if(!needsGrey || this.isGrey) { //Check if the key is grey-brick exclusive
                this.brickSprites.set(
                    spriteKey, 
                    this.engine.library.getImage(`brick_${spriteKey}_${this.color.replace("#", "").toLowerCase()}`));
            }
        });
    }    

    /** Initialize brick sprite */
    public init() {

        var imageName = `BRICK.${this.width}.${this.color}`;

        this.image = this.engine.library.getImageWithSrc(
            imageName,
            this.engine.baker.bake(
                ctx => this.drawBrick(ctx),
                // Width to contain the brick, the right face, and the border
                this.width * GMULTX + Z_DEPTH + 3,
                // Height to contain the brick, the top face, and the border
                GMULTY + Z_DEPTH + 3,
                imageName));
    }
    
    // Setup this brick for pressing
    public press(): void {
        super.press();

        // Can't press static bricks
        if (!this.isStatic) {
            this.studs.forEach(s => s.press());
        }
    }

    /** Setup this brick for selecting */
    public select(pos: Point): void {
        super.select(pos);

        // Select studs for transparency
        this.studs.forEach(s => s.select());
    }

    /** Clear this brick's selection states */
    public deselect(): void {
        super.deselect();

        this.resetStuds(true);
    }

    /** Set the brick to match the cursor position, based on its stored selected position */
    public setToCursor(): void {
        super.setToCursor();

        // Set studs to match the position of this brick while selected.
        this.resetStuds(false);
    }

    /** Snap this brick to the grid based on the given state */
    public snap(state: boolean): void {
        super.snap(state);

        //Also snap the studs, of course.
        this.studs.forEach(s => s.snap(state));
    }

    /** Hide this brick's studs based on a given above row */
    public hideStuds(rowBricks: Brick[]) {

        this.studs.forEach(s => {

            s.isVisible = true;

            for (const brick of rowBricks) {
                
                if (!brick.isSelected &&    // Don't cull based on selected bricks
                    !brick.isPressed &&     // Don't cull based on pressed bricks
                    col1D(                  // Only cull based on bricks overlapping with this stud
                        brick.gpos.x - 1, 
                        brick.gpos.x + brick.width, 
                        s.gpos.x, 
                        s.gpos.x
                    )) {

                    s.isVisible = false;
                    break;                  // Stop all checks once the stud is hidden
                }
            }
        });
    }

    /** Show this brick's studs unconditionally */
    public showStuds() {
        
        this.studs.forEach(s => s.isVisible = true);
    }
 
    /** Reset studs to match the position of this brick */
    private resetStuds(isDeselect : boolean): void {

        for (const [idx, stud] of this.studs.entries()) {

            // Set stud global pos to match this brick
            stud.gpos.set(this.gpos.x + idx, this.gpos.y - 1);
            // Set stud sub pos to match this brick
            stud.spos.set(this.spos);
            // Deselect this stud
            if(isDeselect) {
                stud.deselect();
            }
        }
    }

    /** Set the minimum and maximum carry positions of this brick */
    public setMinMax(min: Vect, max: Vect): void {
        super.setMinMax(min, max);

        this.studs.forEach(s => s.mobilePreviewSize = this.mobilePreviewSize);
    }

    /** Set the flipped state for the mobile preview */
    public flipMobile(isFlipped : boolean) {
        super.flipMobile(isFlipped);

        this.studs.forEach(s => s.flipMobile(isFlipped));
    }

    /** Build the sprite for this brick */
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

            // Draw hole for each brick width, except for the last one
            for (let j = 1; j < this.width; j++) {

                ctx.drawImage(this.brickSprites.get("h")!!, 30 * (j - 1), 0);
            }
        }
    }
}