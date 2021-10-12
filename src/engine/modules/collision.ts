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
    maskMax : number;
    gameObjects: GameObject[];
}

/** Module that handles tags and game objects grouped by tag. */
export default class CollisionModule {

    private scenes : CollidersScene[] = [];

    public pushGOs(sceneName : string, gameObjects : GameObject[]) {

        var max = 0;
        const collidables = gameObjects.filter(g => {
            const curr = g.getColliders();
            curr.forEach(c => max = Math.max(max, c.mask));
            return curr.length > 0;
        });

        this.scenes.push({
            name : sceneName,
            maskMax : max.toString(2).length,
            gameObjects: collidables
        });
    }

    public update() {

        this.scenes.forEach(s => {

            const gocs : GameObjectCollider[] = s.gameObjects.map(go => {
                return {
                    colliders : go.getColliders(),
                    gameObject : go
                }
            });

            const length = gocs.length;

            for(var j = 0; j < length; j++) {
                for(var i = 0; i < j; i++) {
                    this.compareGOColliders(gocs[i], gocs[j]);
                }
            }
        });
    }

    private compareGOColliders(goc1 : GameObjectCollider, goc2 : GameObjectCollider) {
        goc1.colliders.forEach(c1 => 
        goc2.colliders.forEach(c2 => 
            this.compareGOPair(c1, c2, goc1.gameObject, goc2.gameObject)));
    }

    private compareGOPair(c1 : Collider, c2 : Collider, g1 : GameObject, g2 : GameObject) {
        if((c1.mask & c2.mask) && this.compareColliders(c1, c2)) {
            g1.resolveCollision(g2);
            g2.resolveCollision(g1);
        }
    }

    private compareColliders(c1 : Collider, c2 : Collider) : boolean {
        return colRectRectCorners(c1.min, c1.max, c2.min, c2.max)
    }

    public clear(sceneNames: string[]) {
        this.scenes = this.scenes.filter(sg => !sceneNames.some(sn => sg.name == sn));
    }
}
