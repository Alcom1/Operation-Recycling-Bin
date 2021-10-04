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

    constructor(
        private engine: Engine,
        {
            name = "nameless",
            need = [],
            zIndex = 0,
            gameObjects = [],
            initialized = false
        }: SceneParams
    ) {
        this.name = name;
        // Required scenes for this scene to initialize
        this.need = need;
        this.zIndex = zIndex;
        this.gameObjects = [];
        this.initialized = false;
    }

    public init(ctx: CanvasRenderingContext2D, scenes: Scene[]) {
        
        if (
            !this.initialized && 
            this.need.every(n => this.engine.tag.exists(n))
        ) {

            ctx.save();
                this.gameObjects.forEach(go =>  go.init(ctx, scenes));
            ctx.restore();

            this.initialized = true;
        }
    }

    public clear() {
        this.gameObjects = []
    }

    public pushGO(gameObject: GameObject) {
        // Establish parent scene before pushing
        gameObject.parent = this;
        this.gameObjects.push(gameObject);
    }

    public sortGO() {
        //Sort game objects by z-index.
        this.gameObjects.sort((a, b) => a.zIndex - b.zIndex);
    }

    public update(dt: number) {
        if(this.initialized) {
            this.gameObjects.forEach(go => { if(!go.isActive) { return; }
                go.update(dt)
            });
        }
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
