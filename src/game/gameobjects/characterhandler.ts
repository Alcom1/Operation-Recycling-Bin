import GameObject from "engine/gameobjects/gameobject";
import { Step, StepType } from "engine/modules/sync";
import { Point } from "engine/utilities/vect";
import Character from "./character";
import CharacterBin from "./characterbin";
import CharacterBot from "./characterbot";
import CharacterGearClimb from "./charactergearclimb";
import CharacterGearGround from "./charactergearground";

interface CharacterGroup {
    tag: string;
    characters: Character[];
}

interface CharacterTagged {
    tag: string;
    character: Character;
}

/** Handler for brick selection, movement, etc. */
export default class CharacterHandler extends GameObject {

    private characterGroups: CharacterGroup[] = [];
    private isStart: boolean = false;

    private get charactersTagged() : CharacterTagged[] {
        return this.characterGroups.flatMap(x => x.characters.map(y => {
            return {
                tag : x.tag,
                character : y
            } as CharacterTagged
        }));
    }

    /** Initalize the brick handler, get related bricks & game objects, manage bricks */
    public init() {
         
        let allCharacters = this.engine.tag.get(  // Get bricks from scene
            "Character", 
            "Level") as Character[];

        /** Group characters by tag */
        this.characterGroups = allCharacters.reduce((groups, character) => {

            let tag = character.tags.find(t => t != "Character");   //Tag for group
            let group = groups.find(g => g.tag == tag)              //Existing group
            
            //If group exists, add character
            if(group) {
                group.characters.push(character);
            }
            //Otherwise, create new group with character
            else {
                groups.push({
                    tag : tag ?? "",
                    characters : [character]
                })
            }

            return groups;

        }, [] as CharacterGroup[])
    }

    /** A second layer of initialization, gets characters out of unwanted starting positions */
    public update()
    {
        //If this handler hasn't started yet (after constructor and init)
        if(!this.isStart) {

            this.isStart = true;    //Started

            //Update character states by positional order
            this.charactersTagged.forEach(ct => {

                //Unconditional update
                ct.character.handleStepUpdate();
            });
        }
    }

    /** Get all no-place zones */
    public getNoPlaceZones() : Point[] {
        return this.characterGroups.flatMap(x => x.characters).flatMap(x => x.getNoPlaceZone());
    }

    /** Perform synchronous updates for all characters */
    public updateSync(counter : number, loopLength : number) {

        //Map character groups as characters with their specific tag
        let charactersTagged = this.charactersTagged;
        
        //Sort characters by their grid x-pos or grid y-pos.
        charactersTagged.sort((a, b) => 
            a.character.gpos.x - b.character.gpos.x || 
            a.character.gpos.y - b.character.gpos.y);
        
        //Move characters by positional order
        charactersTagged.forEach(ct => {

            // The step matches this character's speed, perform an update
            if (counter % (loopLength / ct.character.speed) == 0) {

                ct.character.handleStep();
            }
        });
        
        //Update character states by positional order
        charactersTagged.forEach(ct => {

            // The step matches this character's speed, perform an update
            if (counter % (loopLength / ct.character.speed) == 0) {

                let isHorzProx = false;
                let isVertProx = false;

                //Proximity check against characters with height 2
                charactersTagged.filter(ct2 => ct2.character.height == 2).forEach(ct2 => {
                    
                    let diff = ct2.character.gpos.getSub(ct.character.gpos);
    
                    //Horizontal proximity
                    if (diff.x < 0 &&                                   //Right-of-way (character on left still moves)
                        Math.abs(diff.x) == 3 &&                        //Character is in proximity range (one gap away)
                        Math.abs(diff.y) < 2)                           //Character is aligned
                    {
                        if (ct.character.move.x == Math.sign(diff.x) && //Moving towards other char
                            ct2.character.move.x == -Math.sign(diff.x)) //Other char moving towards self
                        {
                            isHorzProx = true;
                        }
                    }

                    //Vertical proximity
                    if (diff.y < 0 &&                                   //Right-of-way
                        Math.abs(diff.y) == 3 &&                        //Character is in proximity range (one gap away) 
                        Math.abs(diff.x) < 2)                           //Character is aligned
                    {
                        if (ct.character.move.y == Math.sign(diff.y) && //Moving towards other char
                            ct2.character.move.y == -Math.sign(diff.y)) //Other char moving towards self
                        {
                            isVertProx = true;
                        }
                    }
                });

                ct.character.handleStepUpdate(isHorzProx, isVertProx);
            }
        });
    }
}
