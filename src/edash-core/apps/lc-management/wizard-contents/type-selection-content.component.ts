
import { Component, OnInit } from '@angular/core';
import { WizardConentBase} from './wizard-content-base';
import { LoadcurveInputType } from '../lc-types';

@Component({
    selector: 'type-selection-content',
    templateUrl: 'type-selection-content.html'
})

export class TypeSelectionContentComponent extends WizardConentBase<LoadcurveInputType> {
    constructor() { 
        super();
    }

    public buttons: LcTypeButton[] = [
        {
            text: "Copy & Paste",
            icon: "icon-something",
            type: LoadcurveInputType.Text
        },
        {
            text: "Eigene Lastgang-Datei (Excel, CSV)",
            icon: "icon-something",
            type: LoadcurveInputType.Custom
        },
        {
            text: "Aus Vorlage",
            icon: "icon-something",
            type: LoadcurveInputType.Standard
        },
    ];

    public buttonClicked(type: LoadcurveInputType) {
        this.onFinished.emit(type);
    }

    protected onInit() {

    }



    
}

interface LcTypeButton {
    text: string;
    icon: string;
    type: LoadcurveInputType;
}