import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, NgZone, ElementRef } from '@angular/core';
import { FormControl } from '../forms/FormControl';
import { Utils } from '../../common/Utils';

@Component({
    selector: 'input-number',
    templateUrl: 'input-number.html'
})

export class InputNumberComponent extends FormControl {
    onInit() {
        this.changeDisplayVal();

        // if (this.minValue && (this.innerValue < this.minValue)) {
        //     this.innerValue = this.minValue;
        // }
        this.setSelectionStart(this.leftSide.length);
    }

    constructor(public _elem: ElementRef) {
        super(_elem);
    }

    //#region FormControl override

    @Input()
    public set defaultValue(value) {
        this.setInnerValue(value, false);
    }

    public get formValue() {
        return this.innerValue;
    }

    public setValue(value, emitChange = true) {
        this.setInnerValue(value, emitChange);
    }


    //#endregion FormControl override

    @ViewChild("input")
    private input;


    private innerValue = 0;

    @Input()
    public decimals: number = 2;

    @Input()
    public maxNumbers: number = 10;

    @Input()
    public pxWidth: number = null;

    public displayValue = "";
    private selectionStart: number;

    private decimalSplitter = ".";


    private changeDisplayVal() {
        this.displayValue = this.innerValue.toFixed(this.decimals);
    }

    private changeValue(dir: boolean) {

        let incValue = 1;

        if (this.isOnDecimalSide) {
            let splitterPos = this.displayValue.indexOf(this.decimalSplitter);
            let moves = this.selectionStart - (this.leftSide.length + 1);            

            for (let act = 0; act <= moves - 1; act++) {
                incValue = incValue / 10;
            }

        } else {
            let moves = this.leftSide.length - this.selectionStart;

            for (let act = 0; act <= moves - 1; act++) {
                incValue = incValue * 10;
            }

        }

        let incValDir = dir ? incValue : -incValue;
        let newVal = this.innerValue + incValDir;

        newVal = this.assureRange(newVal);

        this.setInnerValue(newVal, true);
        this.movePosition(0);
    }

    public assureRange(newVal) {
        if (newVal < this.minValue) {
            newVal = this.minValue;
        }

        if (newVal > this.maxValue) {
            newVal = this.maxValue;
        }

        return newVal;
    }

    public increaser;
    public increaserStarter;

    public createIncreaser(dir: boolean) {
        this.increaser = setInterval(() => {            
            this.changeValue(dir);
        }, 100);
    }

    public createIncreaserStarter(dir: boolean) {
        this.increaserStarter = setTimeout(() => {            
            this.createIncreaser(dir);
        }, 300);
    }

    private destroyIncreasers() {
        clearInterval(this.increaserStarter);
        clearInterval(this.increaser);
    }

    public increaseMouseDown() {
        this.changeValue(true);
        this.createIncreaserStarter(true);
    }

    public increaseMouseUp() {
        this.destroyIncreasers();
    }

    public decreaseMouseDown() {
        this.changeValue(false);
        this.createIncreaserStarter(false);
    }

    public decreaseMouseUp() {
        this.destroyIncreasers();
    }


    public onFocus(e) {
        this.setSelectionStart();
    }

    public onClick(e) {
        this.setSelectionStart();
    }

    private setSelectionStart(pos = null) {
        if (!Utils.isNullOrUndefined(pos)) {
            this.selectionStart = pos;
        } else {
            setTimeout(() => {
                this.selectionStart = this.input.nativeElement.selectionStart;
                // console.log("SS: " + this.selectionStart)
            });
        }
    }

    public onKeyDown(e) {
        //: KeyboardEvent

        if (e.key === "Tab") {
            return;
        }

        this.setSelectionStart();

        let val = e.target.value;

        let nums = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
        let nativeKeys = ["ArrowRight", "ArrowLeft", "Home", "End"];
        let otherKeys = ["Backspace", "Delete"];

        let validAction = nums.includes(e.key) || nativeKeys.includes(e.key) || otherKeys.includes(e.key);
        if (!validAction) {
            e.preventDefault();
            return;
        }

        let isNative = nativeKeys.includes(e.key);
        if (isNative) {
            return;
        } else {
            e.preventDefault();
        }

        let isNum = nums.includes(e.key);
        if (isNum) {

            var n = "";
            if (this.isOnDecimalSide) {
                n = this.replaceAt(this.displayValue, this.selectionStart, e.key);
            } else {

                if (this.leftSide.length >= this.maxNumbers) {
                    return;
                }

                n = this.insertAt(this.displayValue, this.selectionStart, e.key);
            }

            this.parseValue(n);
            this.movePosition(1);
            return;
        }

        if (e.key === "Backspace") {

            if (this.isOnDecimalSide) {
                if (this.prevChar === this.decimalSplitter) {
                    return;
                } else {
                    let n = this.replaceAt(this.displayValue, this.selectionStart - 1, "0");
                    this.parseValue(n);
                    this.movePosition(0);
                    return;
                }

            } else {

                if (this.prevChar !== null) {
                    let n = this.replaceAt(this.displayValue, this.selectionStart - 1, "");
                    this.parseValue(n);
                    this.movePosition(-1);
                    return;
                }

            }

        }

        if (e.key === "Delete") {
            if (this.isOnDecimalSide) {
                let n = this.replaceAt(this.displayValue, this.selectionStart, "0");
                this.parseValue(n);
                this.movePosition(0);
                return;
            } else {

                if (this.nextChar !== this.decimalSplitter) {
                    let n = this.replaceAt(this.displayValue, this.selectionStart, "");
                    this.parseValue(n);
                    this.movePosition(0);
                }

            }
        }


    }

    private parseValue(str: string) {
        let ie = this.input.nativeElement;

        ie.blur();
        let val = parseFloat(str);
        val = this.assureRange(val);
        this.setInnerValue(val, true);
    }

    private setInnerValue(value: number, emitChange = true) {
        this.innerValue = value;
        if (emitChange) {
            this.formValueChange();
        }
        this.changeDisplayVal();
    }

    private replaceAt(str, index, replacement) {
        var nstr = str.substr(0, index) + replacement + str.substr(index + 1);
        return nstr;
    }

    private getAt(str, index) {
        let nstr = str.substr(index - 1, 1);
        return nstr;
    }


    private insertAt(str, index, replacement) {
        var nstr = [str.slice(0, index), replacement, str.slice(index)].join('');
        return nstr;
    }

    private movePosition(dir: number) {
        let ss = this.selectionStart + dir;
        let ie = this.input.nativeElement;

        setTimeout(() => {
            ie.setSelectionRange(ss, ss);
            ie.focus();
        }, 10);
    }

    private isDecimalSplitter(char: string) {
        return char === this.decimalSplitter;
    }

    private get leftSide() {
        return this.displayValue.split(this.decimalSplitter)[0];
    }

    private get rightSide() {
        return this.displayValue.split(this.decimalSplitter)[1];
    }

    private get isOnDecimalSide() {
        let i = this.displayValue.indexOf(this.decimalSplitter);

        return this.selectionStart > i;
    }

    private get nextChar() {
        if (this.selectionStart >= this.displayValue.length) {
            return null;
        }

        return this.displayValue[this.selectionStart];
    }

    private get prevChar() {
        if (this.selectionStart <= 0) {
            return null;
        }

        return this.displayValue[this.selectionStart - 1];
    }


}