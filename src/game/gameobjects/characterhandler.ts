import GameObject from "engine/gameobjects/gameobject";
import { Step, StepType } from "engine/modules/sync";
import Character from "./character";
import CharacterBin from "./characterbin";
import CharacterBot from "./characterbot";
import CharacterGearClimb from "./charactergearclimb";
import CharacterGearGround from "./charactergearground";

interface CharacterGroup {
    tag: string;
    characters: Character[]
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
        
        //Fpr all characters in character groups, handle its step
        this.characterGroups.forEach(cg => {

            cg.characters.forEach(c => {

                // The step matches this character's speed, perform an update
                if (step.stepType == StepType.SYNC && step.counter % (loopLength / c.speed) == 0) {

                    switch (cg.tag) {
        
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
                }
            });
        });
    }

    /** Handle specific character */
    private handleCharacterBot(character : Character) {
        character = character as CharacterBot;
    }

    /** Handle specific character */
    private handleCharacterBin(character : Character) {
        character = character as CharacterBin;
    }

    /** Handle specific character */
    private handleCharacterGearGround(character : Character) {
        character = character as CharacterGearGround;
    }

    /** Handle specific character */
    private handleCharacterGearClimb(character : Character) {
        character = character as CharacterGearClimb;
    }
}
