import GameObject from "engine/gameobjects/gameobject";
import { colRectRectCorners, colRectRectCornerSize } from "engine/utilities/math";
import { Point } from "engine/utilities/vect";
import Brick from "./brick";
import Character from "./character";

interface CollisionBox {
    min: Point,
    max: Point
}

export default class CollisionHandler extends GameObject {

    private characters!: Character[];
    private obstacles!: Brick[];

    public init(ctx: CanvasRenderingContext2D) {
        
        this.characters = this.engine.tag.get(["CharacterBin", "CharacterBot"], "Level") as Character[];
        this.obstacles = this.engine.tag.get(["Brick"], "Level").filter(b => !b.tags.includes("BrickNormal")) as Brick[];
    }

    public getCollisionBoxes(min : Point, max : Point) : CollisionBox[] {

        return this.getCBsFromCharacters(min, max).concat(
               this.getCBsFromObstacles(min, max, 1, 2));
    }

    private getCBsFromObstacles(min : Point, max : Point, yUp : number, yDown : number) : CollisionBox[] {

        const ret : CollisionBox[] = [];

        //For all obstacles
        this.obstacles.forEach(obstacle => {

            //Get collider for that obstacle
            const c = { 
                min : obstacle.gpos.getAdd({ x : 0,              y : -yUp}),
                max : obstacle.gpos.getAdd({ x : obstacle.width, y :  yDown}) 
            }

            //If that collider is in the given bounding box, it will be returned
            if(colRectRectCorners(min, max, c.min, c.max)) {
                ret.push(c);
            }
        })

        return ret;
    }

    private getCBsFromCharacters(min : Point, max : Point) : CollisionBox[] {

        const ret : CollisionBox[] = [];

        //For all active characters
        this.characters.filter(c => c.isActive).forEach(character => {

            //Get collider for that character
            const c = { 
                min : character.gpos.getAdd({ x : -1, y : 1 - character.height}), 
                max : character.gpos.getAdd({ x :  1, y : 1}) 
            }

            //If that collider is in the given bounding box, it will be returned
            if(colRectRectCorners(min, max, c.min, c.max)) {
                ret.push(c);
            }
        })

        return ret;
    }
}
