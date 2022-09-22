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
    FRAME,
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

    private scenes          : SyncScene[] = [];
    private timer           : number = 0;
    private stepInterval    : number = 1/15;
    private counter         : number = 0;

    public pushGOs(sceneName : string, sceneObjects : GameObject[]) {

        const gameObjects : GameObject[] = [];

        //Assign all game objects with colliders in this scene as passive or normal.
        sceneObjects.forEach(go => {
            gameObjects.push(go);
        });

        //Only add scene if it has collidables
        if(gameObjects.length > 0) {

            this.scenes.push({
                name : sceneName,
                gameObjects: gameObjects
            });
        }
    }

    //Update - check and trigger collisions for all game objects in all scenes
    public update(dt : number) {
        
        this.timer += dt;

        let isSync = false;

        if(this.timer >= this.stepInterval) {
            this.timer -= this.stepInterval;
            this.counter++;
            isSync = true;
        }

        let step = {
            stepType : isSync ? StepType.SYNC : StepType.FRAME,
            counter : this.counter
        } as Step

        //Trigger collisions for each scene. Scenes don't interact with each other.
        this.scenes.forEach(s => {

            //Get all active game objects with colliders
            s.gameObjects.filter(go => go.isActive).forEach(go => {
                go.updateSync(step, 1 / this.stepInterval);
            });
        });
    }

    //Remove scene reference from colliders
    public clear(sceneNames: string[]) {
        this.scenes = this.scenes.filter(sg => !sceneNames.some(sn => sg.name == sn));
    }
}
