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

        //Do nothing if there are no scenes, stops updates before scenes load, stops early stutter
        if(this.scenes.length == 0) {
            return;
        }
        
        let isStart = this.timer == 0;
        this.timer += dt;               //Advance timer
        let isSync = false;             //If the next step is sychronous (not just an ordinary frame)

        //Check sync
        if (this.timer >= this.stepInterval) {
            this.timer -= this.stepInterval;
            this.counter++;
            isSync = true;
        }

        //Create step object
        let step = {
            stepType : 
                isSync ? StepType.SYNC : 
                isStart ? StepType.START : StepType.FRAME,
            counter : this.counter
        } as Step

        //Trigger updates for each scene.
        this.scenes.forEach(s => {

            //Get all active game objects with colliders
            s.gameObjects.filter(go => go.isActive).forEach(go => {
                go.updateSync(step, 1 / this.stepInterval);
            });
        });
    }

    //Remove scene reference from colliders
    public clear(sceneNames: string[]) {
        this.timer = 0;     //Reset timer for next scene
        this.counter = 0;   //Reset counter for next scene
        this.scenes = this.scenes.filter(sg => !sceneNames.some(sn => sg.name == sn));
    }
}
