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

                let checkProximity = function(
                    diffA : number, 
                    diffB : number, 
                    selfMove : number, 
                    othrMove : number) {
                    
                    return (
                        diffA < 0                    && //Right-of-way (character on left/??? still moves)
                        Math.abs(diffA) == 3         && //Character is in proximity range (one gap away)
                        Math.abs(diffB) < 2          && //Character is aligned
                        selfMove == Math.sign(diffA) && //Moving towards other char
                        othrMove == -Math.sign(diffA))  //Other char moving towards self
                }

                //Proximity check against characters with height 2
                charactersTagged.filter(ct2 => ct2.character.height == 2).forEach(ct2 => {

                    let diff = ct2.character.gpos.getSub(ct.character.gpos);

                    isHorzProx = isHorzProx || checkProximity(diff.x, diff.y, ct.character.move.x, ct2.character.move.x);

                    isVertProx = isVertProx || checkProximity(diff.y, diff.x, ct.character.move.y, ct2.character.move.y);
                });

                ct.character.handleStepUpdate(isHorzProx, isVertProx);
            }
        });
    }
}
