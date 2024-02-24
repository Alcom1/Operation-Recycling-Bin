export enum TouchStyle {
    NONE,
    PREV,
    PUSH
}

/** Module that stores various settings */
export default class SettingsModule {

    private settings = new Map<string, boolean | number | string>();  //Stored settings

    /** Constructor */
    constructor(defaultValues : (boolean | number | string)[][]) {

        //Validate and set default values
        if (defaultValues &&
            defaultValues.every(pair =>
                pair.length == 2 &&
                typeof pair[0] === "string")) {

            //Set default values
            defaultValues.forEach(pair => this.settings.set(pair[0] as string, pair[1]));
        }
        else {
            console.log("WARNING, FAILED TO LOAD DEFAULT SETTINGS. INVALID VALUES.")
        }
    }

    //Get a number setting
    public getBoolean(name : string) : boolean | null {
        
        let value = this.settings.get(name);

        return typeof value === "boolean" ? value : null;
    }

    //Get a number setting
    public getNumber(name : string) : number | null {
        
        let value = this.settings.get(name);

        return typeof value === "number" ? value : null;
    }

    //Get a string setting
    public getString(name : string) : string | null {

        let value = this.settings.get(name);

        return typeof value === "string" ? value : null;
    }
}
