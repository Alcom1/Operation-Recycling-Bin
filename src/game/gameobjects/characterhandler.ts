import GameObject from "engine/gameobjects/gameobject";
import { colRectRectCorners } from "engine/utilities/math";
import { Point } from "engine/utilities/vect";
import Character from "./character";

export default class CharacterHandler extends GameObject {

    private characters!: Character[];

    public init(ctx: CanvasRenderingContext2D) {
        
        this.characters = this.engine.tag.get(["CharacterBin", "CharacterBot"], "Level") as Character[];
    }

    public getCharacterBoxes(min : Point, max : Point) : Character[] {

        return this.characters.filter(c => 
            c.isActive && 
            colRectRectCorners(
                min.x,
                max.x,
                min.y,
                max.y,
                c.gpos.x - 1,
                c.gpos.x + 1,
                c.gpos.y + 1 - c.height,
                c.gpos.y + 1));
    }
}
