
import { Component, OnInit, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { FormControl } from '../forms/FormControl';



@Component({
    selector: 'form-button',
    templateUrl: 'form-button.html'
})

export class FormButtonComponent extends FormControl {
    constructor(public _elem: ElementRef) {
        super(_elem);
    }

    @Input()
    public text: string;

    @Input()
    public cls: string;

    @Output()
    public onButtonClicked = new EventEmitter();

    public exportableValue = false;

    public onClick() {

        if (this.form) {
            this.form.onButtonClicked.emit(this);
        }
        this.onButtonClicked.emit();

    }

    public onKeyDown(e) {
        let clickKeys = ["Enter", "Space"];

        if (clickKeys.includes(e.code)) {
            this.onClick();
        }
    }


}