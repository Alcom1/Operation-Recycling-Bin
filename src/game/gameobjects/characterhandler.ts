import GameObject from "engine/gameobjects/gameobject";
import { Step, StepType } from "engine/modules/sync";
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

    /** Perform synchronous updates for all characters */
    public updateSync(step : Step, loopLength : number) {

        //Map character groups as characters with their specific tag
        let charactersTagged = this.characterGroups.flatMap(x => x.characters.map(y => {
            return {
                tag : x.tag,
                character : y
            } as CharacterTagged
        }))
        
        //Sort characters by their grid x-pos or grid y-pos.
        charactersTagged.sort((a, b) => 
            a.character.gpos.x - b.character.gpos.x || 
            a.character.gpos.y - b.character.gpos.y);
        
        //Check collision of each tagged character in positional order
        charactersTagged.forEach(ct => {

            let c = ct.character;

            // The step matches this character's speed, perform an update
            if (step.stepType == StepType.SYNC && step.counter % (loopLength / c.speed) == 0) {

                switch (ct.tag) {
    
                    case "CharacterBot" :
                        this.handleCharacterBot(c);
                        break;
    
                    case "CharacterBin" :
                        this.handleCharacterBin(c);
                        break;
    
                    case "CharacterGearGround" :
                        this.handleCharacterGearGround(c);
                        break;
    
                    case "CharacterGearClimb" :
                        this.handleCharacterGearClimb(c);
                        break;
                }

                //Always refresh state index here?
                c.setStateIndex();
            }
        });
    }

    /** Handle specific character */
    private handleCharacterBot(characterGeneric : Character) {
        let character = characterGeneric as CharacterBot;

        character.handleBrickCollisionNormal();
    }

    /** Handle specific character */
    private handleCharacterBin(characterGeneric : Character) {
        let character = characterGeneric as CharacterBin;
    }

    /** Handle specific character */
    private handleCharacterGearGround(characterGeneric : Character) {
        let character = characterGeneric as CharacterGearGround;
    }

    /** Handle specific character */
    private handleCharacterGearClimb(characterGeneric : Character) {
        let character = characterGeneric as CharacterGearClimb;
    }
}
