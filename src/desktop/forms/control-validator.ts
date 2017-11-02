import { Utils } from "../../common/Utils";


export class ControlsValidator {

    public isNotEmpty: boolean = null;

}

export class Validator {
    
    public valid = true;
    
    private value: any;
    private cv: ControlsValidator

    constructor(value: any, cv: ControlsValidator) {
        this.value = value;
        this.cv = cv;
    }

    public validate() {
        
        let type = typeof this.value;

        if (!Utils.isNullOrUndefined(this.cv.isNotEmpty)) {
            if (type === "string") {
                if (this.value.length === 0) {
                    this.invalidate();
                }
            }
        }

        return this.valid;
    }

    private invalidate() {
        this.valid =false;
    }

}