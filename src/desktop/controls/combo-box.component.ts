import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

import * as _ from "lodash";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { Utils } from '../../common/Utils';
import { ListFormControl } from '../forms/ListFormControl';



@Component({
    selector: 'combo-box',
    templateUrl: 'combo-box.html'
})

export class ComboBoxComponent
    extends ListFormControl {

    constructor(public _elem: ElementRef) {
        super(_elem);
    }

    @ViewChild("itemsCont")
    public itemsCont;


    @Input()
    public customPxSize: number = null;

    private dropOpenedLoc = false;

    public set dropOpened(opened: boolean) {
        this.dropOpenedLoc = opened;

        if (opened) {
            //todo: here ?
            this.resizeHeight();


            this.form.controls.forEach((c) => {
                if (c.constructor.name === "ComboBoxComponent") {
                    if (c !== this) {
                        let combo = <ComboBoxComponent>c;
                        combo.dropOpened = false;
                    }
                }
            });
        }
    }

    public get dropOpened() {
        return this.dropOpenedLoc;
    }

    public get selectedText() {
        let activeItems = this.getSelectedItems();
        let texts = _.map(activeItems, (i) => {
            return i.text;
        })
        if (Utils.any(activeItems)) {
            let txt = texts.join(", ");
            return txt;
        }

        return "Select item";
    }

    public expandCollapseClicked() {
        this.dropOpened = !this.dropOpened;
    }

    protected itemClickedCustom(i) {
        if (this.singleSelection) {
            this.dropOpened = false;
        }
    }

    protected get listContainer() {
        return this.itemsCont.nativeElement;
    }

    protected onKeyDown(e) {        
        e.preventDefault();

        if (e.code === "ArrowUp") {
            this.dropOpened = true;
            this.changeActiveItem(-1);
        }

        if (e.code === "ArrowDown") {
            this.dropOpened = true;
            this.changeActiveItem(1);
        }

        if (e.code === "Enter" || e.code === "Space") {
            this.itemClicked(this.activeItem);

            if (this.singleSelection) {
                this.dropOpened = false;
            }
        }


    }

}
