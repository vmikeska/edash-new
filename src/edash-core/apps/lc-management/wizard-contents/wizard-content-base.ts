import { Output, EventEmitter, OnInit, Input } from "@angular/core";
import { ControlsForm } from "../../../../desktop/forms/ControlsForm";


export class WizardConentBase<T> implements OnInit {
    
    ngOnInit() {
        this.onInit();
    }

    

    protected onInit() {

    }

    @Input()
    public mainForm: ControlsForm;

    // @Input()
    // public mainDialog: LcWizardComponent;

    // protected getResult() : T { return null;}

    @Output()
    public onChange = new EventEmitter<any>();


    @Output()
    public onFinished = new EventEmitter<T>();
}