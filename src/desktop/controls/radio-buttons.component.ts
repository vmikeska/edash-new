

import { Component, ElementRef, Input } from '@angular/core';
import { Utils } from '../../common/Utils';
import { ListFormControl } from '../forms/ListFormControl';


@Component({
    selector: 'radio-buttons',
    templateUrl: 'radio-buttons.html'
})

export class RadioButtonsComponent
    extends ListFormControl {

    constructor(public _elem: ElementRef) {
        super(_elem)
    }

    @Input()
    public horizontal = false;

    public get orientationClass() {
        return this.horizontal ? "horizontal" : "vertical";
    }

    protected onKeyDown(e) {        
        e.preventDefault();

        if (["ArrowUp", "ArrowLeft"].includes(e.code)) {
            this.changeActiveItem(-1);
        }

        if (["ArrowDown", "ArrowRight"].includes(e.code)) {
            this.changeActiveItem(1);
        }

        if (e.code === "Enter" || e.code === "Space") {
            this.itemClicked(this.activeItem);
        }
    }

    public get formValue() {
        let items = this.getSelectedItems();

        if (!Utils.any(items)) {
            return null;
        }

        let val = items[0].value;
        return val;
    }

}