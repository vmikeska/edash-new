import { Component, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, Input, ViewChildren, } from '@angular/core';
import * as _ from "lodash";

import { Subject } from "rxjs/Subject";
import { ListFormControl } from '../forms/ListFormControl';

@Component({
  selector: 'list-box',
  templateUrl: './list-box.html'
})

export class ListBoxComponent
  extends ListFormControl
  implements AfterViewInit {

  public ngAfterViewInit() {
    setTimeout(() => {
      this.resizeHeight();
    });
  }

  constructor(public _elem: ElementRef) {
    super(_elem)
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

