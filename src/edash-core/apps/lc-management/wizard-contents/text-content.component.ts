
import { Component } from '@angular/core';
import { WizardConentBase } from './wizard-content-base';

@Component({
    selector: 'text-content',
    templateUrl: 'text-content.html'
})

export class TextContentComponent extends WizardConentBase<any> {
    constructor() { super() }


    public onTextChange(text: string) {
        this.onChange.emit(text);
    }

    
}