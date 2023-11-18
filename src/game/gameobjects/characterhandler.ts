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

            //Map character groups as characters with their specific tag
            let charactersTagged = this.charactersTagged;
            
            //Sort characters by their grid x-pos or grid y-pos.
            charactersTagged.sort((a, b) => 
                a.character.gpos.x - b.character.gpos.x || 
                a.character.gpos.y - b.character.gpos.y);

            //Update character states by positional order
            this.handleStepUpdate(charactersTagged, 0, 0, true);
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
            b.character.gpos.y - a.character.gpos.y);
        
        //Move characters by positional order
        charactersTagged.forEach(ct => {

            // The step matches this character's speed, perform an update
            if (counter % (loopLength / ct.character.speed) == 0) {

                ct.character.handleStep();
            }
        });

        //Handle proximity and step updates for all characters
        this.handleStepUpdate(charactersTagged, counter, loopLength)
    }

    //Handle proximity and step updates for all characters
    public handleStepUpdate(
        charactersTagged : CharacterTagged[], 
        counter : number, 
        loopLength : number, 
        isOverride : boolean = false) {
        
        //Update character states by positional order
        charactersTagged.forEach((ct1, i) => {

            // The step matches this character's speed, perform an update
            if (isOverride || counter % (loopLength / ct1.character.speed) == 0) {

                let proxs : Point[] = [];

                //Proximity check against characters with height 2
                charactersTagged.slice(0, i).filter(ct2 => ct2.character.height == 2).forEach(ct2 => {

                    //Distance vector between characters
                    let diff = ct2.character.gpos.getSub(ct1.character.gpos);

                    //In proximity range
                    if (Math.abs(diff.x) <= 3 &&
                        Math.abs(diff.y) <= 3) {

                        //Get proximity with future-expected position of other character
                        proxs.push(diff.getAdd({
                            x : ct2.character.move.y == 0 ? ct2.character.move.x : 0,
                            y : ct2.character.move.y
                        }));
                    }

                });

                //Handle step with proximity results
                ct1.character.handleStepUpdate(proxs);
            }
        });
    }
}
