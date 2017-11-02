
import { Component, OnInit, Input, ViewChild, ElementRef, ViewContainerRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { ControlsForm } from '../forms/ControlsForm';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: 'modal-dialog',
    templateUrl: 'modal-dialog.html'
})

export class ModalDialogComponent {
    constructor(private _cdr: ChangeDetectorRef) {
    }


    public component;

    public contentComponent;

    @ViewChild("contPlaceholder", { read: ViewContainerRef })
    public contPlaceholder: ViewContainerRef;

    @ViewChild("buttonsCont")
    public buttonsCont;

    @Input()
    public maxWidth = 600;

    @Input()
    public minWidth = 400;

    @Input()
    public title = "";

    public buttonsManager = new ButtonsManager(this);

    public close() {
        this.component.destroy();
        this.contentComponent.destroy();
    }


}

export class ButtonsManager {    
    

    constructor(private dlg: ModalDialogComponent) {

    }

    public buttons = new BehaviorSubject<DialogButton[]>([]);
    public closeBtn: DialogButton;

    public addCustomButton(btn : DialogButton) {
        this.buttons.value.push(btn);
        
    }

    public addEasyButton(text: string, callback: () => void) {
        let btn: DialogButton = {            
            form: null,
            tabIndex: -1,
            text: text,
            visible: true,
            callback: callback
        };

        this.addCustomButton(btn);
        return btn;
    }

    public addCloseButton() {
      this.closeBtn = this.addEasyButton("Close", () => { this.dlg.close(); });
    }

    public hideAllButtonsExceptClose() {
        this.buttons.value.forEach((b) => {
            if (b != this.closeBtn) {
                b.visible = false;
            }
        })
    }
    
}


export class DialogButton {
    public form: ControlsForm;
    public tabIndex: number;

    public text: string;
    public callback?: () => void;
    public visible: boolean;
}