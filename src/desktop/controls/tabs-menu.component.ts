import { Component, Input, OnInit, EventEmitter, Output, ElementRef } from '@angular/core';
import { TabItem } from './tabs.component';
import { $ } from '../../common/globals';


@Component({
  selector: 'tabs-menu',
  templateUrl: './tabs-menu.html',
})

export class TabsMenuComponent implements OnInit {

  constructor(private _elem: ElementRef) {

  }

  ngOnInit() {
    if (this.startOpened) {
      this.activateItem(this.items[0]);
    } else {
      this.collapsed = true;
    }

    this.createCloser();
  }

  @Input()
  public startOpened = true;

  private activeClass = "active";
  private lastActive: TabItem;

  @Input()
  public content: HTMLElement;

  private collapsedInternal = false;

  private get collapsed() {
    return this.collapsedInternal;
  }

  private set collapsed(val: boolean) {
    this.collapsedInternal = val;

    let $cont = $(this.content);

    if (this.collapsedInternal) {
      $cont.addClass("hidden");
    } else {
      $cont.removeClass("hidden");
    }
  }



  @Input()
  public items: TabItem[];

  public tabClicked(item) {
    this.activateItem(item);
  }

  public changeCollapsed() {
    this.collapsed = !this.collapsed;
  }

  private createCloser() {

    this.content.insertAdjacentHTML("afterbegin", `<div class="svc-line"><span class="close icon-times"></span></div>`);

    let closer = this.content.getElementsByClassName("close")[0];
    closer.addEventListener("click", () => {

      this.collapsed = true;
      this.deactivateCurrent();

    }, false);
  }

  private activateItem(item: TabItem) {

    if (this.collapsed) {
      this.changeCollapsed();
    }

    this.deactivateCurrent();

    item.active = true;

    let tab = this.findTab(item.id);
    $(tab).addClass(this.activeClass);

    this.lastActive = item;
  }

  private deactivateCurrent() {
    if (this.lastActive) {
      this.lastActive.active = false;
      let tab = this.findTab(this.lastActive.id);
      $(tab).removeClass(this.activeClass);
    }
  }

  private findTab(className) {

    let cont = this.content;

    let tabs = cont.getElementsByClassName(className);
    if (tabs.length === 0) {
      throw `tab '${className}' not found`;
    }

    return tabs[0];
  }
}


