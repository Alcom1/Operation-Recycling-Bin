import GameObject from "engine/gameobjects/gameobject";
import { colRectRectCornerSize } from "engine/utilities/math";
import { Point } from "engine/utilities/vect";
import Brick from "./brick";
import Character from "./character";

export default class CharacterHandler extends GameObject {

    private characters!: Character[];
    private obstacles!: Brick[];

    public init(ctx: CanvasRenderingContext2D) {
        
        this.characters = this.engine.tag.get(["CharacterBin", "CharacterBot"], "Level") as Character[];
        this.obstacles = this.engine.tag.get(["BrickBase"], "Level").filter(b => !b.tags.includes("Brick")) as Brick[];
    }

    public getCollisionBoxes(min : Point, max : Point) : Character[] {

        // c.gpos.x - 1,
        // c.gpos.x + 1,
        // c.gpos.y + 1 - c.height,
        // c.gpos.y + 1,

        return this.characters.filter(c => {
            
            return c.isActive && 
            colRectRectCornerSize(
                min,
                max,
                c.gpos.getAdd({x : -1, y : 1 - c.height}), 
                {x : 2, y : c.height})
            });
    }
}
