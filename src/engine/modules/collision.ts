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

interface GameObjectCollider {
    colliders : Collider[],
    gameObject : GameObject
}

interface CollidersScene {
    name: string;
    gameObjects: GameObject[];
    passObjects: GameObject[];  // Passive game objects that don't interact with each other
}

/** Module that handles tags and game objects grouped by tag. */
export default class CollisionModule {
    
    private scenes          : CollidersScene[] = [];

    public pushGOs(sceneName : string, sceneObjects : GameObject[]) {

        const gameObjects : GameObject[] = [];
        const passObjects : GameObject[] = [];

        // Assign all game objects with colliders in this scene as passive or normal.
        sceneObjects.forEach(go => {

            const colliders = go.getColliders();
            
            gameObjects.push(go);

            if (colliders.some(c => c.mask == 0)) {
                passObjects.push(go);
            }
        });

        // Only add scene if it has collidables
        if (gameObjects.length > 0 || passObjects.length > 0) {

            this.scenes.push({
                name : sceneName,
                gameObjects: gameObjects,
                passObjects: passObjects
            });
        }
    }

    /** Update - check and trigger collisions for all game objects in all scenes */
    public update() {

        // Trigger collisions for each scene. Scenes don't interact with each other.
        this.scenes.forEach(s => {

            // Get all active game objects with colliders
            const gocs : GameObjectCollider[] = s.gameObjects.filter(go => go.isActive).map(go => {
                return {
                    colliders : go.getColliders(),
                    gameObject : go
                }
            });

            // Stair loop to set collisions
            for(let j = 0; j < gocs.length; j++) {
                for(let i = 0; i < j; i++) {
                    this.compareGOColliders(gocs[i], gocs[j]);
                }
            }

            // Resolve all collisions
            s.gameObjects.forEach(go => go.resolveClearCollisions());
        });
    }

    /** Debug Draw */
    public draw(ctx : CanvasRenderingContext2D) {

        ctx.strokeStyle = "#F00";
        ctx.lineWidth = 2;

        this.scenes.forEach(s =>
            s.gameObjects.filter(go => go.isActive).forEach(go =>
                go.getColliders().forEach(c => {

                    if (c.isSub) {
                        ctx.strokeStyle = '#000'
                        ctx.strokeRect(
                            c.min.x,
                            c.min.y,
                            c.max.x - c.min.x,
                            c.max.y - c.min.y
                        )
                    }
                    else {
                        // Color box based on most significant bit
                        ctx.strokeStyle = `hsl(${c.mask.toString(2).length * 48},100%,50%)`
                        ctx.strokeRect(
                            c.min.x * GMULTX + 1,
                            c.min.y * GMULTY - 1,
                            c.max.x * GMULTX - c.min.x * GMULTX,
                            c.max.y * GMULTY - c.min.y * GMULTY
                        )
                    }
                })
            )
        );
    }

    /** Get passive colliders that are within the given box */
    public collidePassive(min : Point, max : Point) : Collider[] {

        return this.getPassiveColliders().filter(c => colRectRectCorners(c.min, c.max, min, max))
    }

    /** Get passive colliders (mask == 0) */
    private getPassiveColliders() : Collider[] {

        return this.scenes
            .map(s => s.passObjects)
            .flat()
            .map(go => {
                return go.isActive ? go.getColliders().filter(c => c.mask == 0) : [];
            })
            .flat();
    }

    /** Compare all colliders between two game objects */
    private compareGOColliders(goc1 : GameObjectCollider, goc2 : GameObjectCollider) {
        goc1.colliders.forEach(c1 => 
        goc2.colliders.forEach(c2 => 
            this.compareGOPair(c1, c2, goc1.gameObject, goc2.gameObject)));
    }

    /** Check & resolve collision between two colliders */
    private compareGOPair(c1 : Collider, c2 : Collider, g1 : GameObject, g2 : GameObject) {
        if ((c1.mask & c2.mask) && this.compareColliders(c1, c2)) {
            g1.setCollision(c1.mask & c2.mask, g2);
            g2.setCollision(c1.mask & c2.mask, g1);
        }
    }

    /** Compare two colliders, check if they overlap */
    private compareColliders(c1 : Collider, c2 : Collider) : boolean {

        // Collider subtypes match. No need to convert
        if (c1.isSub == c2.isSub) {
            return colRectRectCorners(
                c1.min, 
                c1.max, 
                c2.min, 
                c2.max)
        }
        // Divide colliders by grid multipliers if based on subpositions
        else {
            return colRectRectCorners(
                c1.isSub ? (c1.min as Vect).getDiv(GMULTX, GMULTY) : c1.min, 
                c1.isSub ? (c1.max as Vect).getDiv(GMULTX, GMULTY) : c1.max, 
                c2.isSub ? (c2.min as Vect).getDiv(GMULTX, GMULTY) : c2.min, 
                c2.isSub ? (c2.max as Vect).getDiv(GMULTX, GMULTY) : c2.max)
        }
    }

    /** Remove scene reference from colliders */
    public clear(sceneNames: string[]) {
        this.scenes = this.scenes.filter(sg => !sceneNames.some(sn => sg.name == sn));
    }
}
