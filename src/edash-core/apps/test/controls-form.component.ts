import { Component } from "@angular/core";
import { WinContentBase } from "../../../desktop/components/win-content-base";

import * as moment from "moment";

@Component({
    selector: 'controls-form',
    templateUrl: './controls-form.html',
})

export class ControlsFormComponent extends WinContentBase {

    public calendarMin: moment.Moment;
    public calendarMax: moment.Moment;

    public timeDefault: moment.Moment;

    public calEnabled = false;

    protected onInit() {
        this.calendarMin = moment().add(-8, "days").add(-5, "months");
        this.calendarMax = moment().add(8, "days").add(2, "year");

        this.timeDefault = moment().add(-6, "hours");
    }

}