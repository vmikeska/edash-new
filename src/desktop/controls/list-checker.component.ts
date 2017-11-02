
import { Component, Input, ElementRef, AfterViewInit } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { ListFormControl, ListItem } from "../forms/ListFormControl";

@Component({
    selector: 'list-checker',
    templateUrl: './list-checker.html'
})


export class ListCheckerComponent
    extends ListFormControl
    implements AfterViewInit {

    constructor(public _elem: ElementRef) {
        super(_elem)
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.resizeHeight();
        });
    }

    public selectFirst = false;
    public singleSelection = false;
    public hideActiveAfterSelection = false;

    public getSelectedClass(i: ListItem) {
        return i.selected ? "selected" : "unselected";
    }

    

    protected get listContainer() {
        return this.focusableElement.nativeElement;
    }

    protected onKeyDown(e) {
        e.preventDefault();

        if (e.code === "ArrowUp") {
            this.changeActiveItem(-1);
        }

        if (e.code === "ArrowDown") {
            this.changeActiveItem(1);
        }

        if (e.code === "Enter" || e.code === "Space") {
            this.itemClicked(this.activeItem);
        }
    }

}