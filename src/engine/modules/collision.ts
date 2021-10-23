import GameObject from "engine/gameobjects/gameobject";
import Scene from "engine/scene/scene";
import { colRectRectCorners } from "engine/utilities/math";
import { Point } from "engine/utilities/vect";

export interface Collider {
    mask : number,
    min : Point,
    max : Point
}

interface GameObjectCollider {
    colliders : Collider[],
    gameObject : GameObject
}

interface CollidersScene {
    name: string;
    gameObjects: GameObject[];
    passObjects: GameObject[];  //Passive game objects that don't interact with each other
}

/** Module that handles tags and game objects grouped by tag. */
export default class CollisionModule {

    private scenes : CollidersScene[] = [];

    public pushGOs(sceneName : string, sceneObjects : GameObject[]) {

        const gameObjects : GameObject[] = [];
        const passObjects : GameObject[] = [];

        //Assign all game objects with colliders in this scene as passive or normal.
        sceneObjects.forEach(go => {

            const colliders = go.getColliders();

            if(colliders.some(c => c.mask == 0)) {
                passObjects.push(go);
            }
            if(colliders.some(c => c.mask > 0)) {
                gameObjects.push(go);
            }
        });

        //Only add scene if it has collidables
        if(gameObjects.length > 0 || passObjects.length > 0) {

            this.scenes.push({
                name : sceneName,
                gameObjects: gameObjects,
                passObjects: passObjects
            });
        }
    }

    //Update - check and trigger collisions for all game objects in all scenes
    public update() {

        //Trigger collisions for each scene. Scenes don't interact with each other.
        this.scenes.forEach(s => {

            //Get all active game objects with colliders
            const gocs : GameObjectCollider[] = s.gameObjects.filter(go => go.isActive).map(go => {
                return {
                    colliders : go.getColliders(),
                    gameObject : go
                }
            });

            //Stair loop for collisions
            for(var j = 0; j < gocs.length; j++) {
                for(var i = 0; i < j; i++) {
                    this.compareGOColliders(gocs[i], gocs[j]);
                }
            }
        });
    }

    //Get passive colliders that are within the given box
    public collidePassive(min : Point, max : Point) : Collider[] {

        return this.getPassiveColliders().filter(c => colRectRectCorners(c.min, c.max, min, max))
    }

    //Get passive colliders (mask == 0)
    private getPassiveColliders() : Collider[] {

        return this.scenes
            .map(s => s.passObjects)
            .flat()
            .map(go => {
                return go.isActive ? go.getColliders().filter(c => c.mask == 0) : [];
            })
            .flat();
    }

    //Compare all colliders between two game objects
    private compareGOColliders(goc1 : GameObjectCollider, goc2 : GameObjectCollider) {
        goc1.colliders.forEach(c1 => 
        goc2.colliders.forEach(c2 => 
            this.compareGOPair(c1, c2, goc1.gameObject, goc2.gameObject)));
    }

    //Check & resolve collision between two colliders
    private compareGOPair(c1 : Collider, c2 : Collider, g1 : GameObject, g2 : GameObject) {
        if((c1.mask & c2.mask) && this.compareColliders(c1, c2)) {
            g1.resolveCollision(c1.mask & c2.mask);
            g2.resolveCollision(c1.mask & c2.mask);
        }
    }

    //Compare two colliders, check if they overlap
    private compareColliders(c1 : Collider, c2 : Collider) : boolean {
        return colRectRectCorners(c1.min, c1.max, c2.min, c2.max)
    }

    //Remove scene reference from colliders
    public clear(sceneNames: string[]) {
        this.scenes = this.scenes.filter(sg => !sceneNames.some(sn => sg.name == sn));
    }
}
