import { Component, Input, ViewChild, AfterViewInit, Output, EventEmitter, ChangeDetectorRef, OnInit, NgZone, ElementRef } from '@angular/core';
import * as _ from "lodash";
import { ListFormControl, ListItem } from '../forms/ListFormControl';

@Component({
  selector: 'list-button',
  templateUrl: './list-button.html'
})

export class ListButtonComponent 
  extends ListFormControl
  implements AfterViewInit {



  ngAfterViewInit() {    
    setTimeout(() =>  {
      this.resizeHeight();          
    });    
  }

  constructor(public _elem: ElementRef) {
    super(_elem)
  }


  @Input()
  public editable = false;

  @Input()
  public buttons: ButtonItem[] = [];

  @Input()
  public clickable = false;

  
  @Output()
  public buttonClicked = new EventEmitter<BtnEvent>();

  @Output()
  public onNameSave = new EventEmitter<ListItem>();
  

  public editTxt(i: ListItem) {
    this.items.forEach((item) => {
      if (item.editing) {
        this.cancelTxt(item);
      }
    })

    i.editing = true;
  }

  public saveTxt(i: ListItem) {
    this.onNameSave.emit(i);
    i.editing = false;
  }

  public editKeyDown(e: KeyboardEvent, i: ListItem) {
    if (e.key === "Enter") {
      this.saveTxt(i);
    }
  }

  public cancelTxt(i: ListItem) {
    i.text = this.prop(i.origModel, this.textMapping);
    i.editing = false;
  }

  public itemClick(action: string, i: ListItem) {
    var e: BtnEvent = { action: action, item: i }
    this.buttonClicked.emit(e);
  }



  

}

export class BtnEvent {
  public action: string;
  public item: ListItem;
}

export class ButtonItem {
  public ico: string;
  public action: string;
  public caption: string;
}

