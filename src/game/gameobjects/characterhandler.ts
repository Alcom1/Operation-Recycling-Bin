import GameObject from "engine/gameobjects/gameobject";
import Vect, { Point } from "engine/utilities/vect";
import Character from "./character";

/** Handler for brick selection, movement, etc. */
export default class CharacterHandler extends GameObject {

    private characters: Character[] = [];
    private isStart: boolean = false;

    /** Initalize the brick handler, get related bricks & game objects, manage bricks */
    public init() {
         
        this.characters = this.engine.tag.get(  // Get bricks from scene
            "Character", 
            "Level") as Character[];
    }

    /** A second layer of initialization, gets characters out of unwanted starting positions */
    public update()
    {
        // If this handler hasn't started yet (after constructor and init)
        if(!this.isStart) {

            this.isStart = true;    // Started

            // Map character groups as characters with their specific tag
            let charactersTagged = this.characters;
            
            // Sort characters by their grid x-pos or grid y-pos.
            charactersTagged.sort((a, b) => 
                a.gpos.x - b.gpos.x || 
                a.gpos.y - b.gpos.y);

            // Update character states by positional order
            this.handleStepUpdate(charactersTagged, 0, 0, true);
        }
    }

    /** Get all no-place zones */
    public getNoPlaceZones() : Point[] {
        return this.characters.flatMap(x => x.getNoPlaceZone());
    }

    /** Perform synchronous updates for all characters */
    public updateSync(counter : number, loopLength : number) {

        // Map character groups as characters with their specific tag
        let charactersTagged = this.characters;
        
        // Sort characters by their grid x-pos or grid y-pos.
        charactersTagged.sort((a, b) => 
            a.gpos.x - b.gpos.x || 
            b.gpos.y - a.gpos.y);
        
        // Move characters by positional order
        charactersTagged.forEach(ct => {

            // The step matches this character's speed, perform an update
            if (counter % (loopLength / ct.speed) == 0) {

                ct.handleStep();
            }
        });

        // Handle proximity and step updates for all characters
        this.handleStepUpdate(charactersTagged, counter, loopLength)
    }

    // Handle proximity and step updates for all characters
    public handleStepUpdate(
        charactersTagged : Character[], 
        counter : number, 
        loopLength : number, 
        isOverride : boolean = false) {
        
        // Update character states by positional order
        charactersTagged.forEach((ct1, i) => {

            // The step matches this character's speed, perform an update
            if (isOverride || counter % (loopLength / ct1.speed) == 0) {

                let oldState = [ct1.move.get, ct1.stateIndex] as [Vect, number];
                let proxs : Point[] = [];

                // Proximity check against characters with height 2 and normal movement
                charactersTagged.slice(0, i).filter(
                    ct2 => ct2.height == 2 && 
                    ct2.isNormalMovment &&
                    ct2.speed != 0).forEach(ct2 => {

                    // Distance vector between characters
                    let diff = ct2.gpos.getSub(ct1.gpos);

                    // In proximity range
                    if (Math.abs(diff.x) <= 3 &&
                        Math.abs(diff.y) <= 3) {

                        // Get proximity with future-expected position of other character
                        proxs.push(diff.getAdd({
                            x : ct2.move.y == 0 ? ct2.move.x : 0,
                            y : ct2.move.y
                        }));
                    }

                });

                // Handle step with proximity results
                ct1.handleStepUpdate(proxs);

                //Zero subposition if a character has changed directions or state for any reason.
                if(oldState[0].getDiff(ct1.move) || oldState[1] != ct1.stateIndex) {
                    
                    ct1.spos = Vect.zero;
                }
            }
        });
    }
}
