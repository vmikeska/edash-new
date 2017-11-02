
import { Component } from '@angular/core';
import { WizardConentBase } from './wizard-content-base';
import { ControlsValidator } from '../../../../desktop/forms/control-validator';

@Component({
    selector: 'parse-values-content',
    templateUrl: 'parse-values-content.html'
})

export class ParseValuesContentComponent extends WizardConentBase<ParseValuesForm> {
   
    public lettersValidator = new ControlsValidator();

    protected onInit() {
        this.buildLettersValidator();
    }

    private buildLettersValidator() {
        this.lettersValidator.isNotEmpty = true;
    }
}

export interface ParseValuesForm {
    date: string; 
    time: string; 
    volume: string;
    sheetNo: number; 
    firstDataRow: number;
}