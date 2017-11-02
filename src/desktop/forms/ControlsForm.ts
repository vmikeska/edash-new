import { FormControl } from "./FormControl";
import { EventEmitter } from "@angular/core";
import { DelayedReturn } from "../../common/DelayedReturn";


import * as _ from "lodash";
import { Utils } from "../../common/Utils";
import { Validator } from "./control-validator";


export class ControlsForm {

    constructor() {
        this.initAllControlsAddedFnc();
    }

    public controls: FormControl[] = [];

    public onValueChanged = new EventEmitter<ControlValueChangedEvent>();
    public onAllControlsAdded = new EventEmitter();
    public onButtonClicked = new EventEmitter<FormControl>();

    public activateFirst = true;

    public maxIndex = 0;

    public addToForm(control: FormControl) {
        this.controls.push(control);
        this.allControlsDelayed.call();
    }

    private allControlsDelayed: DelayedReturn;

    private initAllControlsAddedFnc() {
        this.allControlsDelayed = new DelayedReturn(20);
        this.allControlsDelayed.callback = () => {
            this.onAllControlsLoaded();
        }
    }

    private onAllControlsLoaded() {
        this.maxIndex = _.maxBy(this.controls, "formTabIndex").formTabIndex;

        this.activateForm();

        this.onAllControlsAdded.emit();
    }

    public activateForm() {
        this.setTabIndex();

        if (this.activateFirst) {
            this.activateFirstControl();
        }
    }

    public activateFirstControl() {
        let enabledControls = _.filter(this.controls, (c) => {
            return c.enabled;
        })
        let minIndexControl = _.minBy(enabledControls, "formTabIndex");
        if (minIndexControl) {
            let minIndex = minIndexControl.formTabIndex;
            this.setActiveControlByNo(minIndex);
        }
    }

    public setActiveControlByNo(no: number) {
        let control = _.find(this.controls, { formTabIndex: no });

        setTimeout(() => {
            control.focusableElement.nativeElement.focus();
        }, 200);
    }

    public valueChanged(control: FormControl) {
        let evnt: ControlValueChangedEvent = {
            control: control
        };
        this.onValueChanged.emit(evnt);
    }

    public getControlByName(name: string) {
        let c = _.find(this.controls, { name: name });
        return c;
    }

    public get isValid() {
        let valid = true;

        this.controls.forEach((c) => {
            if (c.validator) {
                let validator = new Validator(c.formValue, c.validator)
                let isValid = validator.validate();

                if (!isValid) {
                    valid = false;
                }

            }
        });

        return valid;
    }

    public getValuesJson<T>() {
        let j = {};
        this.controls.forEach((c) => {
            if (c.exportableValue) {
                j[c.name] = c.formValue;
            }
        });

        return <T>j;
    }

    public setTabIndex() {

        //when implementing functionality with more forms, this number will come from FormManager as the lastTabIndex of last control
        let tabIndexStart = 0;

        let controls = _.orderBy(this.controls, "formTabIndex");

        controls.forEach((c) => {
            if (!Utils.isNullOrUndefined(c.formTabIndex) && c.enabled) {
                let ti = tabIndexStart + c.formTabIndex;
                c.tabindex = ti;
            }
        });
    }

    public unsetTabIndex() {
        this.controls.forEach((c) => {
            if (!Utils.isNullOrUndefined(c.formTabIndex)) {
                c.tabindex = -1;
            }
        });
    }
}

export class ControlValueChangedEvent {
    public control: FormControl;

}