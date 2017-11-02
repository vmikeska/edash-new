
import { Component, OnInit, Input, ElementRef } from '@angular/core';

import * as moment from 'moment';
import { FormControl } from '../forms/FormControl';

@Component({
    selector: 'time-control',
    templateUrl: 'time-control.html'
})

export class TimeControlComponent
    extends FormControl {
    constructor(public _elem: ElementRef) {
        super(_elem);
    }

    public timeInternal = moment();

    public opened = false;

    public hours = 0;
    public minutes = 0;

    //#region FormControl override

    @Input()
    public set defaultValue(value) {
        this.timeInternal = value;        
    }

    public get formValue() {
        return { hours: this.hours, minutes: this.minutes }
    }

    public setValue(value, emitChange = true) {
        this.setInnerValue(value, emitChange);
    }


    //#endregion FormControl override

    protected onInit() {
        this.setInnerValue(this.timeInternal, false);
    }

    private setInnerValue(value: moment.Moment, emitChange) {        
        let t = value;

        this.hours = t.hours();
        this.minutes = t.minutes();

        if (emitChange) {
            this.formValueChange();
        }
    }

    public closeClicked() {
        this.opened = false;
    }

    public componentClick() {
        this.opened = !this.opened;
    }

    public hoursChanged(e) {
        this.hours = e;
        this.updateTime();
    }

    public minutesChanged(e) {
        this.minutes = e;
        this.updateTime();
    }

    private updateTime() {
        this.timeInternal.hours(this.hours).minutes(this.minutes);
    }




}