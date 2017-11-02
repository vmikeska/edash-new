

import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { FormControl } from '../forms/FormControl';

@Component({
    selector: 'textarea-input',
    templateUrl: 'textarea-input.html'
})

export class TextareaInputComponent  extends FormControl {
    
    constructor(public _elem: ElementRef) {
        super(_elem);
    }

    @ViewChild("textarea")
    public textareaControl;

    @Input()
    public set defaultValue(value) {
        this.textareaControl.nativeElement.value = value;        
    }

    @Input()
    public maxLength = 10000;
    
    @Input()
    public placeholder = "";

    public get formValue() {
        return this.textareaControl.nativeElement.value;
    }

    public onInput() {
        this.formValueChange();
    }


}