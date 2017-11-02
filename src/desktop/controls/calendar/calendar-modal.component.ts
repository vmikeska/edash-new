
import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';


import * as moment from 'moment';
import * as _ from "lodash";
import { FormControl } from '../../forms/FormControl';
import { CalendarDialogComponent } from './calendar-dialog.component';
import { MdlgCreationService } from '../../services/mdlg-creation.service';
import { DelayedReturn } from '../../../common/DelayedReturn';

@Component({
    selector: 'calendar-modal',
    templateUrl: 'calendar-modal.html'
})

export class CalendarModalComponent
    extends FormControl {

    constructor(public _elem: ElementRef, private _mdlgCreateSvc: MdlgCreationService) {
        super(_elem)
    }

    private today = moment();

    public date: moment.Moment = this.today;

    @ViewChild("input1")
    public input1;

    @ViewChild("input2")
    public input2;

    @ViewChild("input3")
    public input3;

    public dateBoxClass1: string;
    public dateBoxClass2: string;
    public dateBoxClass3: string;
    public splitter: string;

    public dateBoxValue1: string;
    public dateBoxValue2: string;
    public dateBoxValue3: string;

    public dateBoxMaxLength1: number;
    public dateBoxMaxLength2: number;
    public dateBoxMaxLength3: number;

    public dateValid = true;

    public currentActiveNo = null;

    //#region FormControl override

    @Input()
    public set defaultValue(date) {
        this.assignDate(date, false);
    }

    public get formValue() {
        return this.date;
    }

    public setValue(value, emitChange = true) {
        // super.setValue(value);

        this.assignDate(value, emitChange);
        this.analyzeDate();
    }

    @Input()
    public minValue?: moment.Moment = null;

    @Input()
    public maxValue?: moment.Moment = null;



    //#endregion FormControl override



    protected onInit() {
        this.initWritingCallback();
        this.analyzeDate();
    }

    protected onKeyDown(e) {

        if (["Space", "Enter"].includes(e.code)) {
            this.openDialog();
        }

        if (["ArrowLeft", "ArrowRight"].includes(e.code) && !this.currentActiveNo) {
            this.moveActiveBox(1, 0);
        }

    }

    public inputKeyDown(e, no) {

        if (e.code === "ArrowLeft") {
            this.moveActiveBox(no, -1);
            return;
        }

        if (e.code === "ArrowRight") {
            this.moveActiveBox(no, +1);
            return;
        }

        let allowed = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete"];
        if (!allowed.includes(e.key)) {
            return false;
        }

    }

    private moveActiveBox(no: number, dir: number) {

        let num = no + dir;
        if (num < 1) {
            num = 3;
        }
        if (num > 3) {
            num = 1
        }

        let elem;

        if (num === 1) {
            elem = this.input1.nativeElement;
        }

        if (num === 2) {
            elem = this.input2.nativeElement;
        }

        if (num === 3) {
            elem = this.input3.nativeElement;
        }

        elem.focus();
        setTimeout(() => {
            elem.setSelectionRange(0, elem.value.length);
        })

    }


    public inputFocusIn(no) {
        this.currentActiveNo = no;
        this.moveActiveBox(no, 0)
    }

    private writingCallback: DelayedReturn;

    private initWritingCallback() {
        this.writingCallback = new DelayedReturn(1500);
        this.writingCallback.callback = () => {
            this.buildInputDate();
        }
    }

    public textChanged() {
        this.writingCallback.call();
    }

    private buildInputDate() {
        let str = `${this.dateBoxValue1}${this.splitter}${this.dateBoxValue2}${this.splitter}${this.dateBoxValue3}`;
        let date = moment(str, "l");
        this.assignDate(date, true);
    }

    private assignDate(date, emitChange) {
        this.date = date;
        this.dateValid = this.date.isValid();

        if (this.dateValid) {
            if (this.minValue) {
                if (this.date.isBefore(this.minValue)) {
                    this.date = this.minValue.clone();
                    this.analyzeDate();
                }
            }

            if (this.maxValue) {
                if (this.date.isAfter(this.maxValue)) {
                    this.date = this.maxValue.clone();
                    this.analyzeDate();
                }
            }
        }

        if (this.dateValid) {
            if (emitChange) {
                this.formValueChange();
            }
        }
    }

    private getClassByLenght(length: number) {
        return `box${length}`;
    }

    private analyzeDate() {
        let dateString = this.date.format("L");

        let splitters = [];

        for (let actLetter = 0; actLetter <= dateString.length - 1; actLetter++) {
            let letter = dateString[actLetter];

            let parsedLetter = parseInt(letter);
            if (isNaN(parsedLetter)) {
                splitters.push(letter);
            }
        }

        let uniqSplitters = _.uniq(splitters);

        if (uniqSplitters.length === 1) {

            let splitter = splitters[0];

            this.splitter = splitter;

            let dateParams = dateString.split(splitter);

            let numbers = [];
            let dps = [];

            for (let actDateParam = 1; actDateParam <= dateParams.length; actDateParam++) {
                let param = dateParams[actDateParam - 1];
                let value = param;
                let length = param.length;

                if (actDateParam === 1) {
                    this.dateBoxValue1 = value;
                    this.dateBoxClass1 = this.getClassByLenght(length);
                    this.dateBoxMaxLength1 = length;
                }

                if (actDateParam === 2) {
                    this.dateBoxValue2 = value;
                    this.dateBoxClass2 = this.getClassByLenght(length);
                    this.dateBoxMaxLength2 = length;
                }

                if (actDateParam === 3) {
                    this.dateBoxValue3 = value;
                    this.dateBoxClass3 = this.getClassByLenght(length);
                    this.dateBoxMaxLength3 = length;
                }
            }

        } else {
            throw "Unknown format of the date"
        }
    }

    public calendarClicked() {
        this.openDialog();
    }

    private openDialog() {


        let insts = this._mdlgCreateSvc.createInst(CalendarDialogComponent,
            (content) => {
                content.disablePastDays = false;
                content.date = this.date.clone();

                content.control = this;
            },
            (dialog) => {
                dialog.title = "Pick a date";

                

                dialog.buttonsManager.addCloseButton();

                dialog.buttonsManager.addEasyButton("Select date", () => {
                    let cont = <CalendarDialogComponent>dialog.contentComponent.instance;
                    this.setValue(cont.date);
                    dialog.close();
                })
            }
        );



    }



}