import { Component, Input, OnInit, EventEmitter, Output, ElementRef } from '@angular/core';
import { $ } from '../../common/globals';


@Component({
  selector: 'tabs',
  templateUrl: './tabs.html',
})

export class TabsComponent implements OnInit {
  ngOnInit(): void {
    this.activateItem(this.items[0]);
  }

  private activeClass = "active";
  public lastActive: TabItem;

  @Input()
  public collapsable = false;

  public collapsed = false;

  constructor(private _elem: ElementRef) {

  }

  @Input()
  public items: TabItem[];

  @Output()
  public onTabClicked = new EventEmitter<TabItem>();

  public tabClicked(item) {
    this.onTabClicked.next(item);
    this.activateItem(item);
  }

  public changeCollapsed() {
    this.collapsed = !this.collapsed;
    
    this.onCollapsedChange.emit(this.collapsed);
  }

  @Output()
  public onCollapsedChange = new EventEmitter<boolean>();

  private activateItem(item: TabItem) {

    if (this.collapsed) {
      this.changeCollapsed();
    }

    this.lastActive = item;

    this.items.forEach((i) => {
      i.active = false;

      let tab = this.findTab(i.id);
      $(tab).removeClass(this.activeClass);      
    });

    item.active = true;
    if (!this.collapsed) {
      let tab = this.findTab(item.id);      
      $(tab).addClass(this.activeClass);
    }

  }

  private findTab(className) {
    let parent = this._elem.nativeElement.parentElement;

    let maxIters = 10;
    let currentIter = 0;

    let tab = null;
    
    while (currentIter < maxIters) {      
      tab = parent.getElementsByClassName(className);
      if (tab.length > 0) {
        break;
      } else {
        parent = parent.parentElement;
      }

      currentIter++;
    }

    if (!tab) {
      throw `tab '${className}' not found`;
    }

    return tab[0];
  }
}

export class TabItem {
  public name: string;
  public id: string;
  public active?= false;
}


