export enum TouchStyle {
    NONE,
    PREV,
    PUSH
}

/** Module that stores various settings */
export default class SettingsModule {

    private settings = new Map<string, string | number>();  //Stored settings

    /** Constructor */
    constructor(defaultValues : (string | number)[][]) {

        //Validate and set default values
        if (defaultValues &&
            defaultValues.every(pair =>
                pair.length == 2 &&
                typeof pair[0] === "string")) {

            //Set default values
            defaultValues.forEach(pair => this.settings.set(pair[0] as string, pair[1]));
        }
    }

    //Get a string setting
    public getString(name : string) : string | null {

        let value = this.settings.get(name);

        return typeof value === "string" ? value : null;
    }

    //Get a number setting
    public getNumber(name : string) : number | null {
        
        let value = this.settings.get(name);

        return typeof value === "number" ? value : null;
    }
}
