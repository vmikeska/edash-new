

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'number-vertical',
    templateUrl: 'number-vertical.html'
})

export class NumberVerticalComponent implements OnInit {
    constructor() { }


    @Output()
    public valueChange = new EventEmitter<number>();

    private innerValue = 0;

    public get value() {
        return this.innerValue;
    }


    @Input()
    public set value(val: number) {
        this.innerValue = val;

        this.valueChange.emit(this.innerValue);
    }


    @Input()
    public minValue?: number = null;

    @Input()
    public maxValue?: number = null;

    @Input()
    public step = 1;

    @Input()
    public overflowReset = true;

    public up() {
        this.changeValue(1);
    }

    public down() {
        this.changeValue(-1);
    }

    private changeValue(val) {
        let v = this.value + val;

        if (this.overflowReset) {
            //todo: check, min&max values must be set

            if (v < this.minValue) {
                v = this.maxValue;
            }

            if (v > this.maxValue) {
                v = this.minValue;
            }
        } else {
            if (this.minValue != null) {
                if (v < this.minValue) {
                    v = this.minValue;
                }
            }

            if (this.maxValue != null) {
                if (v > this.maxValue) {
                    v = this.maxValue;
                }
            }
        }

        this.value = v;
    }



    ngOnInit() { }
}