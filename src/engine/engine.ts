import GameObject, {GameObjectParams} from "./gameobjects/gameobject";
import BakerModule from "./modules/baker";
import CollisionModule from "./modules/collision";
import LibraryModule from "./modules/library";
import MouseModule from "./modules/mouse";
import SettingsModule from "./modules/settings";
import SyncModule from "./modules/sync";
import TagModule from "./modules/tag";
import Scene, {SceneParams} from "./scene/scene";
import {clamp} from "./utilities/math";

/** Engine core */
export default class Engine {

    /** HTML Canvas */
    private canvas: HTMLCanvasElement;
    /** HTML Canvas Context */
    private ctx: CanvasRenderingContext2D;
    /** Timestamp of last frame for calculating dt */
    private lastTime: number = 0;
    /** Path scenes are located in */
    private scenePath: string;
    /** All Scenes */
    private sceneDatas : {
        scene: SceneParams;
        gameObjects: GameObjectParams[]
    }[] = [];
    /** Currently loaded scenes */
    private scenesActive: Scene[] = [];
    /** Loading screen scenes */
    private scenesLoading: Scene[] = [];
    /** Names of scenes to be added next frame */
    private pushSceneNames: string[] = [];
    /** Names of scenes to be removed next frame */
    private killSceneNames: string[] = [];
    /** All possible types of Game Objects */
    private gameObjectTypes = new Map<string, typeof GameObject>();

    /** If the last frame threw an error */
    private crashed = false;

    /** Public Modules */
    public baker: BakerModule;
    public collision: CollisionModule;
    public library: LibraryModule;
    public mouse: MouseModule;
    public settings: SettingsModule;
    public sync: SyncModule;
    public tag: TagModule;

    /** Constructor */
    constructor(
        element: HTMLCanvasElement,
        scenePathName: string,
        sceneSource: string,
        startScenes: string[],
        gameObjectTypes: typeof GameObject[],
        settings: (boolean | number | string)[][],
        private debug: boolean = false,
        private width: number = 1296,
        private height: number = 864,
        private physicsPerSecond = 15,
        private physicsLagUpdateMax = 5
    ) {
        this.scenePath = scenePathName;

        // Canvas/WebGL Context
        this.canvas = element;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.maxWidth = this.canvas.width + "px";
        this.canvas.style.maxHeight = this.canvas.height + "px";
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error("Unable to acquire WebGL context");
        this.ctx = ctx;

        // Set up modules
        this.baker = new BakerModule(this.canvas);
        this.collision = new CollisionModule();
        this.library = new LibraryModule();
        this.mouse = new MouseModule(this, this.canvas);
        this.mouse.setResolution(this.canvas.width, this.canvas.height);
        this.settings = new SettingsModule(settings);
        this.sync = new SyncModule(this.physicsPerSecond);
        this.tag = new TagModule();

        // Register available game object types
        this.registerGameObjects(gameObjectTypes);

        // Establish starting scenes
        this.pushSceneNames = startScenes;

        // Load each starting & loading scene
        this.loadScenes(sceneSource, this.scenesActive).finally(() => {
            this.physicsFrame();
            this.frame();
        });
    }

    /** Physics Update loop - Asynchronous */
    private async physicsFrame(): Promise<void> {

        let t1 = Date.now();                        // Previous time
        let timeCount = 0;                          // Timer for physics
        let timeMin = 1000 / this.physicsPerSecond; // Number of miliseconds between physics updates

        let physicsLagCount = 0;

        while (true) {

            // Add time difference to count
            let t2 = Date.now();
            timeCount += t2 - t1;
            t1 = t2;

            // If time difference is beyond minimum, do at least one physics update
            while(timeCount >= timeMin) {

                // If exceeded the maximum number of physics updates for large lag spikes, stop
                if(physicsLagCount >= this.physicsLagUpdateMax) {
                    timeCount = 0;      // Reset timer, no more updates
                    break;              // Stop
                }

                // Perform updates
                if (this.library.getLoaded()) {
                    this.collision.update();    // Check collisions
                    this.sync.update();         // Resolve statuses
                }

                physicsLagCount++;      // Count lag
                timeCount -= timeMin;   // Subtract duration from physics timer
            }
            physicsLagCount = 0;        // Reset lag count after physics updates are finished

            await new Promise(resolve => setTimeout(resolve, 2));
        }
    }

    /** Update loop */
    private frame(): void {

        requestAnimationFrame(() => {
            // Don't continue throwing errors repeatedly without hope of recovering
            if (this.crashed) return;
            try {
                this.frame()
            } catch(e) {
                this.crashed = true;
                throw e;
            }
        });
        
        // Setup frame
        // Calculate time delta since last frame
        const dt = this.calculateDeltaTime();

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Unload and load scenes
        this.unloadScenes(this.killSceneNames);

        // Load each scene name in the push list
        this.pushSceneNames.map(sn => this.loadScene(sn, this.scenesActive));

        // Reset push list
        this.pushSceneNames = [];

        // Scene actions
        if (this.library.getLoaded()) {
            this.initScenes();
            this.updateDrawScenes(this.scenesActive, dt);
        }
        else {
            this.updateDrawScenes(this.scenesLoading, dt);
        }

        // Module updates
        this.mouse.update(dt);
    }

    /** Initialize all scenes */
    private initScenes(): void {
        this.scenesLoading.forEach(s => s.init(this.ctx));
        this.scenesActive.forEach(s => s.init(this.ctx));
    }

    /** Perform both an update and draw */
    private updateDrawScenes(scenes : Scene[], dt: number): void {
        scenes.forEach(s => s.update(dt));
        scenes.forEach(s => s.draw(this.ctx));
        scenes.forEach(s => s.superDraw(this.ctx));

        // Debug views
        if (this.debug) {
            this.collision.draw(this.ctx);
        }
    }

    /** Load all scene data */
    private async loadScenes(sceneName: string, scenes: Scene[]): Promise<void> {
        const sceneResponse = await fetch(`${this.scenePath}${sceneName}.json`);

        this.sceneDatas = await sceneResponse.json();
    }

    /** Load a scene */
    private loadScene(sceneName: string, scenes: Scene[]) {

        const sceneData = this.sceneDatas.find(s => s.scene.tag == sceneName);

        if (sceneData) {

            const scene = new Scene(this, sceneData.scene);

            for (const goData of sceneData.gameObjects) {
                // Construct the object from its name
                const GOType = this.gameObjectTypes.get(goData.name);
                if (!GOType) throw new Error(`GameObject of type ${goData.name} does not exist`);
                const go = new GOType({...goData, engine : this, scene});
                scene.pushGO(go);
            }
            
            scenes.push(scene);
            scenes.sort((a, b) => a.zIndex - b.zIndex);
        }
        else {
            throw new Error(`Scene with tag ${sceneName} does not exist`);
        }
    }

    /** Unload scenes pending removal */
    private unloadScenes(killSceneNames: string[]): void {
        if (killSceneNames.length > 1) {

            // Clear scene names from core
            this.scenesActive = this.scenesActive.filter(s => !this.killSceneNames.includes(s.name)); 
            this.tag.clear(this.killSceneNames);
            this.sync.clear(this.killSceneNames);
            this.collision.clear(this.killSceneNames);
            this.killSceneNames = [];
        }
    }

    /** 
     * Set scenes to be loaded
     * @param fileNames File name(s) of scenes to load
    */
    public pushScenes(fileNames: string | string[]): void {
        if (Array.isArray(fileNames)) {
            fileNames.forEach(s => this.pushScene(s));
        } else {
            this.pushScene(fileNames);
        }
    }

    /** 
     * Set scenes to be unloaded
     * @param sceneNames Scene name(s) to be unloaded
    */
    public killScenes(sceneNames: string | string[]): void {
        if (Array.isArray(sceneNames)) {
            sceneNames.forEach(s => this.killScene(s));
        } else {
            this.killScene(sceneNames);
        }
    }

    /** 
     * Set scene to be loaded
     * @param fileName Filename of scene to load
    */
    private pushScene(fileName: string): void {
        if (!this.pushSceneNames.includes(fileName)) {
            this.pushSceneNames.push(fileName);
        }
    }

    /** 
     * Set scene to be unloaded
     * @param sceneName Scene name of scene to unload
    */
    private killScene(sceneName: string): void {
        if (!this.killSceneNames.includes(sceneName)) {
            this.killSceneNames.push(sceneName);
        }
    }

    /** Unload all current scenes */
    public killAllScenes(): void {
        this.killScenes(this.scenesActive.map(s => s.name));
    }

    /** 
     * Get time since last frame
     * @returns Time since last frame
    */
    private calculateDeltaTime(): number {
        // Date as milliseconds
        const now = (+new Date);
        // Frames per second, limited between 12 and 240
        const fps = clamp(1000 / (now - this.lastTime), 12, 240);
        // Record timestamp for next frame
        this.lastTime = now;
        // Return delta time, the milliseconds between this frame and the previous frame
        return 1/fps;
    }

    /** Register a game object type */
    private registerGameObjects(gameObjectTypes: typeof GameObject[]): void {
        for (const GOType of gameObjectTypes) {
            this.gameObjectTypes.set(GOType.name, GOType);
        }
    }
}
