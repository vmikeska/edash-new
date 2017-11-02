
import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Utils } from '../../common/Utils';
import { FormControl } from '../forms/FormControl';

@Component({
    selector: 'value-slider',
    templateUrl: 'value-slider.html',
    host: {
        '(window:mouseup)': 'onMouseUp($event)',
        '(window:mousemove)': 'onMouseMove($event)',
    },
})

export class ValueSliderComponent extends FormControl {

    constructor(public _elem: ElementRef) {
        super(_elem);
    }

    protected onInit() {
        this.calculateFixedWidth();

        this.resetMoverPos();
    }

    private calculateFixedWidth() {
        if (!Utils.isNullOrUndefined(this.widthPx)) {
            this.stepPxInternal = this.widthPx / this.stepsCount;
        }
    }

    @ViewChild("middle")
    public middleElement;

    @ViewChild("mover")
    public moverElement;

    @Input()
    public stepsCount = 10;

    private stepPxInternal: number;

    //achtung: either stepPx or maxWidth can be set, not both

    @Input()
    public set stepPx(value: number) {
        this.stepPxInternal = value;
    }

    @Input()
    public widthPx: number = null;

    //achtung: either stepPx or maxWidth can be set, not both


    public internalValue: number;
    public currentLeft: number;

    public movingStarted = false;

    public moverWidth = 14;

    private lastStep = this.internalValue;
    private lastRsIndex = null;


    @Input()
    public set defaultValue(val) {
        this.setValueInternal(val, false);
    }

    @Input()
    public set defaultIndex(index) {
        let value = Math.floor(this.stepsCount * index);
        this.setValueInternal(value, false);
    }

    public get formValue() {
        let valueIndex = this.internalValue / this.stepsCount;

        let res: ValueSliderResult = {
            index: valueIndex,
            step: this.internalValue
        };

        return res;
    }

    public setValue(value, emitChange = true) {
        this.setValueInternal(value, emitChange);
    }

    public setIndex(index, emitChange = true) {
        let value = Math.floor(this.stepsCount * index);
        this.setValueInternal(value, emitChange);
    }

    private assureRangeInternal(value: number) {
        let newVal = Utils.assureRange(value, 0, this.stepsCount);
        return newVal;
    }

    public onMouseUp(e) {
        this.movingStarted = false;
    }


    private setValueInternal(value: number, emitChange = true) {
        if (value === this.internalValue) {
            return;
        }

        let safeValue = this.assureRangeInternal(value);
        this.internalValue = safeValue;
        this.resetMoverPos();
        if (emitChange) {
            this.formValueChange();
        }
    }

    public get parts() {
        let ps = [];
        for (let act = 1; act <= this.stepsCount; act++) {
            ps.push(act);
        }
        return ps;
    }

    public valueClicked(e) {
        let val = this.calcValueByX(e.offsetX);

        this.setValueInternal(val);
    }

    private moverOffset: number;

    public moverClicked(e: MouseEvent) {
        this.movingStarted = true;
        this.moverOffset = e.offsetX;        
    }

    public onMouseMove(e: MouseEvent) {

        if (this.movingStarted) {
            let middleElemRect = this.middleElement.nativeElement.getBoundingClientRect();

            let valueX = (e.clientX - middleElemRect.left) - this.moverOffset - 1;

            let val = this.calcValueByX(valueX);
            this.setValueInternal(val);
        }
    }


    public move(forward) {
        let newVal = this.internalValue;

        if (forward) {
            newVal++;
        } else {
            newVal--;
        }

        this.setValueInternal(newVal);
    }

    private resetMoverPos() {
        this.currentLeft = this.getMoverPos(this.internalValue);
    }

    private getMoverPos(val) {
        let v = (val * this.stepPxInternal) + 1;
        return v;
    }

    private isMovingRight(wholeSteps, rsIndex) {

        if (this.lastRsIndex === null) {
            this.lastRsIndex = rsIndex;
            this.lastStep = wholeSteps;
            return null;
        }

        if (wholeSteps > this.lastStep) {
            this.lastRsIndex = rsIndex;
            this.lastStep = wholeSteps;
            return true;
        }

        if (wholeSteps < this.lastStep) {
            this.lastRsIndex = rsIndex;
            this.lastStep = wholeSteps;
            return false;
        }

        if (this.lastRsIndex !== null) {

            let isRightDir = rsIndex > this.lastRsIndex;

            this.lastRsIndex = rsIndex;
            this.lastStep = wholeSteps;

            return isRightDir;
        }

        return null;
    }

    private calcValueByX(x) {

        let wholeSteps = Math.floor(x / this.stepPxInternal);

        let restStep = x % this.stepPxInternal;
        let rsIndex = restStep / this.stepPxInternal;

        if (this.lastRsIndex !== null) {

            let isRightDir = this.isMovingRight(wholeSteps, rsIndex);

            if (isRightDir !== null) {

                if (isRightDir) {
                    if (rsIndex > 0.5) {
                        wholeSteps++;
                    }
                }

            }

        } else {
            this.lastRsIndex = rsIndex;
        }

        return wholeSteps;
    }


}

export class ValueSliderResult {
    index: number;
    step: number;
}

export class ValueSliderUtils {
    public static getRealValue(min: number, max: number, index: number) {
        let range = max - min;

        let value = min + (range * index);
        return value;
    }

    public static getIndexValue(min: number, max: number, value: number) {
        let range = max - min;
        let index = (value - min) / range;
        return index;
    }
}