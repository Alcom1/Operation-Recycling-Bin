import GameObject from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import { colRectRectCorners, GMULTX, GMULTY } from "engine/utilities/math";
import Vect, { Point } from "engine/utilities/vect";

export interface Collider {
    mask : number,
    min : Point,
    max : Point,
    isSub? : Boolean
}

export enum StepType {
    START,
    SYNC
}

export interface Step {
    stepType : StepType,
    counter : number
}

interface SyncScene {
    name: string;
    gameObjects: GameObject[];
}

/** Module that handles tags and game objects grouped by tag. */
export default class SyncModule {
    
    private scenes  : SyncScene[] = [];
    private counter : number = 0;

    /** 
    * @param physicsPerSecond Number of physics checks per second
    */
    constructor(private physicsPerSecond = 15) {
        
    }

    public pushGOs(sceneName : string, sceneObjects : GameObject[]) {

        const gameObjects : GameObject[] = [];

        // Assign all game objects with colliders in this scene as passive or normal.
        sceneObjects.forEach(go => {
            gameObjects.push(go);
        });

        // Only add scene if it has collidables
        if (gameObjects.length > 0) {

            this.scenes.push({
                name : sceneName,
                gameObjects: gameObjects
            });
        }
    }

    /** Update - check and trigger collisions for all game objects in all scenes */
    public update() {

        // Do nothing if there are no scenes, stops updates before scenes load, stops early stutter
        if (this.scenes.length == 0) {
            return;
        }

        // Trigger updates for each scene.
        this.scenes.forEach(s => {

            // Get all active game objects with colliders
            s.gameObjects.filter(go => go.isActive).forEach(go => {
                go.updateSync(this.counter, this.physicsPerSecond);
            });
        });

        //Increment counter for next update
        this.counter++;
    }

    /** Remove scene reference from colliders */
    public clear(sceneNames: string[]) {
        this.counter = 0;   // Reset counter for next scene
        this.scenes = this.scenes.filter(sg => !sceneNames.some(sn => sg.name == sn));
    }
}
