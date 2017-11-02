
import { Component, Input, EventEmitter } from '@angular/core';
import { DlgContentBase } from '../../../desktop/components/dlg-content-base';
import { TabItem } from '../tabs.component';

import * as  moment from 'moment'
import { CalendarModalComponent } from './calendar-modal.component';

@Component({
    selector: 'calendar-dialog',
    templateUrl: 'calendar-dialog.html'
})

export class CalendarDialogComponent
    extends DlgContentBase {

    public control: CalendarModalComponent;

    public days: Days;

    public disablePastDays = false;
    public date: moment.Moment;

    public monthGroups = [];

    public yearsGroups = [];

    protected onInit() {
        this.days = new Days(this.control);

        this.days.update(this.date, this.disablePastDays);
        this.buildYearsGroup();
        this.buildMontsGroup();
    }

    public getMonthTxt(no) {
        return moment(no, "MM").format("MMM");
    }

    private buildYearsGroup(midYearInput?: number) {
        let midYear = midYearInput ? midYearInput : this.date.year();

        this.yearsGroups = [
            [this.buildYearItem(midYear - 4), this.buildYearItem(midYear - 3), this.buildYearItem(midYear - 2)],
            [this.buildYearItem(midYear - 1), this.buildYearItem(midYear), this.buildYearItem(midYear + 1)],
            [this.buildYearItem(midYear + 2), this.buildYearItem(midYear + 3), this.buildYearItem(midYear + 4)]
        ];
    }

    private buildMontsGroup() {
        this.monthGroups = [
            [this.buildMonthItem(1), this.buildMonthItem(2), this.buildMonthItem(3)],
            [this.buildMonthItem(4), this.buildMonthItem(5), this.buildMonthItem(6)],
            [this.buildMonthItem(7), this.buildMonthItem(8), this.buildMonthItem(9)],
            [this.buildMonthItem(10), this.buildMonthItem(11), this.buildMonthItem(12)]
        ];
    }

    private buildYearItem(year: number) {
        let item: NumberDateItem = {
            num: year,
            disabled: this.isYearOffRange(year)
        };
        return item;
    }

    private buildMonthItem(month: number) {
        let item: NumberDateItem = {
            num: month,
            disabled: this.isMonthOffRange(month)
        };
        return item;
    }

    private isMonthOffRange(month: number) {

        let monthDate = this.date.clone().month(month - 1);

        if (this.control.minValue) {
            let offRange = monthDate.isBefore(this.control.minValue);            
            if (offRange) {
                return true;
            }
        }

        if (this.control.maxValue) {
            let offRange = monthDate.isAfter(this.control.maxValue);
            if (offRange) {
                return true;
            }
        }

        return false;
    }

    private isYearOffRange(year: number) {

        if (this.control.minValue) {
            let offRange = year < this.control.minValue.year();
            if (offRange) {
                return true;
            }
        }

        if (this.control.maxValue) {
            let offRange = year > this.control.maxValue.year();
            if (offRange) {
                return true;
            }
        }

        return false;
    }

    public showArrows = false;

    public tabs: TabItem[] = [
        { id: "contDays", name: "days" },
        { id: "contMonths", name: "months" },
        { id: "contYears", name: "years" }
    ];

    public arrowClicked(dir) {
        let midYear = this.yearsGroups[1][2].num;

        if (dir === "prev") {
            midYear -= 10;
        }

        if (dir === "next") {
            midYear += 8;
        }

        this.buildYearsGroup(midYear);
    }

    public onTabClicked(tab: TabItem) {
        this.showArrows = (tab.id === "contYears");

        if (tab.id === "contDays") {
            this.days.update(this.date, this.disablePastDays);
        }

        if (tab.id === "contMonths") {
            this.buildMontsGroup();
        }

        if (tab.id === "contMonths") {
            this.buildYearsGroup();
        }
    }

    public dayClicked(day: CalDay) {
        this.days.selectDay(day);
        this.date = day.date;
    }

    public monthClick(month: number) {
        this.date.set("month", month - 1);
    }

    public yearClick(year: number) {
        this.date.set("year", year);
    }


}

class NumberDateItem {
    public num: number;
    public disabled: boolean;
}

class Days {

    public names: CalTitleDay[];
    public weeks: CalWeek[];

    //this.calDate = origDate.format("MMMM YYYY");

    constructor(private control: CalendarModalComponent) {

    }

    public update(initDate: moment.Moment, disablePastDays: boolean) {

        let now = moment();

        let titleDays: CalTitleDay[] = [];
        let weeks: CalWeek[] = [];

        let origDate = moment(initDate);

        let date = this.getCalStart(initDate);
        let end = this.getCalEnd(initDate);

        let weekendDays = [6, 7];

        let titleFinished = false;
        let notEnd = true;

        while (notEnd) {

            let week: CalWeek = {
                days: []
            };
            weeks.push(week);

            for (let act = 1; act <= 7; act++) {

                if (!titleFinished) {

                    let day: CalTitleDay = {
                        text: date.format("dd"),
                        weekend: false
                    }

                    titleDays.push(day);

                    if (weekendDays.includes(act)) {
                        day.weekend = true;
                    }
                }

                let day: CalDay = {
                    dayNo: date.date(),
                    date: date.clone()
                };
                week.days.push(day);

                let daysDiff = now.diff(date, "day");
                let dayIsInPast = daysDiff > 0;

                let pastDisabledTakesEffect = dayIsInPast && disablePastDays;
                let dayOffRange = this.isDayOffRange(day);
                day.disabled = pastDisabledTakesEffect || dayOffRange;

                if (weekendDays.includes(act)) {
                    day.weekend = true;
                }

                if (origDate.month() === date.month() && origDate.date() === date.date()) {
                    day.active = true;
                }

                if (end.month() === date.month() && end.date() === date.date()) {
                    notEnd = false;
                }

                date.add(1, "days");
            }

            titleFinished = true;
        }

        this.names = titleDays;
        this.weeks = weeks;
    }

    private isDayOffRange(day: CalDay) {

        if (this.control.minValue) {
            let offRange = day.date.isBefore(this.control.minValue);
            if (offRange) {
                return true;
            }
        }

        if (this.control.maxValue) {
            let offRange = day.date.isAfter(this.control.maxValue);
            if (offRange) {
                return true;
            }
        }

        return false;
    }

    public unselectDays() {
        this.weeks.forEach((week) => {
            week.days.forEach((day) => {
                day.active = false;
            });
        })
    }

    public selectDay(day: CalDay) {
        this.unselectDays();
        day.active = true;
    }

    private getCalStart(date) {
        var d = date.clone();
        d.startOf("month");
        d.startOf("week");

        return d;
    }

    private getCalEnd(date) {
        var d = date.clone();

        d.endOf("month");
        d.endOf("week");
        return d;
    }
}


export class CalWeek {
    public days: CalDay[];
}

export class CalDay {
    public date: moment.Moment;
    public dayNo: number;
    public active?= false;
    public weekend?= false;
    public disabled?= false;
}

export class CalTitleDay {
    public text: string;
    public weekend = false;
}