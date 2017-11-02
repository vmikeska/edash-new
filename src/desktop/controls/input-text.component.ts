

import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { FormControl } from '../forms/FormControl';

@Component({
    selector: 'input-text',
    templateUrl: 'input-text.html'
})

export class InputTextComponent  extends FormControl {
    
    constructor(public _elem: ElementRef) {
        super(_elem);
    }

    @ViewChild("input")
    public inputControl;

    @Input()
    public set defaultValue(value) {        
        this.inputControl.nativeElement.value = value;        
    }

    @Input()
    public maxLength = 10000;
    
    @Input()
    public placeholder = "";

    public get formValue() {
        return this.inputControl.nativeElement.value;
    }

    public onInput() {
        this.formValueChange();
    }


}
