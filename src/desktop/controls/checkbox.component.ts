import { Component, OnInit, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { FormControl } from '../forms/FormControl';


@Component({
    selector: 'checkbox',
    templateUrl: 'checkbox.html'
})

export class CheckboxComponent extends FormControl {
    constructor(public _elem: ElementRef) {
        super(_elem);
    }

    //#region FormControl override

    @Input()
    public set defaultValue(value: boolean) {
        this.checked = value;
    }

    public get formValue() {
        return this.checked;
    }

    public setValue(value, emitChange = true) {
        this.checked = value;
        if (emitChange) {
            this.onChange.emit();
        }
    }

    private toggleValue() {
        if (!this.enabled) {
            return;
        }

        this.checked = !this.checked;
        
        this.formValueChange();
    }


    //#endregion FormControl override

    public checked = false;

    @Input()
    public text: string;

    public onClick() {
        this.toggleValue();
    }

    public keyDown(e) {
        let actCodes = ["Space", "Enter"];
        if (actCodes.includes(e.code)) {
            this.toggleValue();
        }
    }

}