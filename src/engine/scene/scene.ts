import Engine from "engine/engine";
import GameObject from "engine/gameobjects/gameobject";
import { GMULTX, GMULTY } from "engine/utilities/math";

export interface SceneParams {
    name?: string,
    tag?: string,
    need?: string[],
    zIndex?: number,
    gameObjects?: GameObject[],
    initialized?: boolean;
}

export default class Scene {
    public name: string;
    private need: string[];
    public zIndex: number;
    private gameObjects: GameObject[];
    private initialized: boolean;
    private isSortNext: boolean = false;

    /** Constructor */
    constructor(
        private engine: Engine,
        {
            name = "unnamed",
            need = [],
            zIndex = 0
        }: SceneParams
    ) {
        this.name = name;
        // Required scenes for this scene to initialize
        this.need = need;
        this.zIndex = zIndex;
        this.gameObjects = [];
        this.initialized = false;
    }
    public init(ctx: CanvasRenderingContext2D) {
        
        if (
            !this.initialized && 
            this.need.every(n => this.engine.tag.exists(n))
        ) {

            ctx.save();
                this.gameObjects.forEach(go =>  go.init(ctx));
            ctx.restore();

            this.engine.sync.pushGOs(this.name, this.gameObjects);
            this.engine.collision.pushGOs(this.name, this.gameObjects);

            this.initialized = true;
        }
    }
    public pushGO(gameObject: GameObject) : GameObject {
        // Establish parent scene before pushing
        gameObject.parent = this;
        this.gameObjects.push(gameObject);
        return gameObject;
    }
    public update(dt: number) {

        // Update all game objects
        if (this.initialized) {
            this.gameObjects.forEach(go => { if (!go.isActive) { return; }
                go.update(dt)
            });
        }

        // Sort all game objects for drawing - unconditionally
        this.gameObjects.sort((a, b) => a.zIndex - b.zIndex);
    }
    public draw(ctx: CanvasRenderingContext2D) {
        if (this.initialized) {
            this.gameObjects.filter(go => go.isActive).forEach(go => this.subDraw(ctx, go, go.draw));
        }
    }
    public superDraw(ctx: CanvasRenderingContext2D) {
        if (this.initialized) {
            this.gameObjects.filter(go => go.isActive).forEach(go => this.subDraw(ctx, go, go.superDraw));
        }
    }
    private subDraw(ctx: CanvasRenderingContext2D, gameObject : GameObject, drawAction : Function) {

        ctx.save();
        ctx.translate(
            gameObject.gpos.x * GMULTX + gameObject.spos.x, 
            gameObject.gpos.y * GMULTY + gameObject.spos.y
        );
        drawAction.call(gameObject, ctx);
        ctx.restore();
    }
}
