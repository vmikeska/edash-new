import { Component, ViewChild, ElementRef, ViewContainerRef, OnInit, NgZone, ChangeDetectorRef, Type, ComponentRef } from '@angular/core';
import { Http, RequestOptionsArgs, RequestOptions } from "@angular/http";

import * as _ from "lodash";
import { MenuCloser } from './menu-closer';

import { DynamicCreationService } from '../../../desktop/services/dynamic-creation.service';

import { DashboardConfig } from './dashboard-config';
import { NotificationService, MessageState } from '../../services/notification.service';
import { WinInstanceService } from '../../../desktop/services/win-instance.service';
import { TaskEvent, TaskRunningService } from '../../services/task-running.service';
import { TestBtnService } from './test-btn.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.html',
})

export class DashboardComponent implements OnInit {

  ngOnInit() {
    this.minimizedAppsSubscribe();

    this._taskSvc.taskStateChange.subscribe((e) => {
      this.onTaskChange(e);
    });

    this._notifSvc.messagesSub.subscribe((msgs) => {
       let mc = this.getMenuItemByStrId("DashAppsMenuComponent");
       let newMsgs = _.filter(msgs, { status: MessageState.New })

       mc.messages = newMsgs.length;       
      //  this._cdr.detectChanges();
    })


    this.menuItems = _.map(DashboardConfig.menuItems, (mi: DashboardMenuItem) => {
      let item: DashboardMenuItemVM = {
        type: mi.type,
        icon: mi.icon,
        title: mi.title,
        strId: mi.type.name
      };
      return item;
    })

    this.menuCloser.onTimeout.subscribe(() => {
      this.closeMenu();
    })
  }

  constructor(
    private _createSvc: DynamicCreationService,
    private _winInstSvc: WinInstanceService,    
    private _taskSvc: TaskRunningService,    
    private _notifSvc: NotificationService,    
    private _testBtnSvc: TestBtnService
    // private _cdr: ChangeDetectorRef,


  ) {

  }

  public testBtnClick() {
    this._testBtnSvc.execute();
  }

  private minimizedAppsSubscribe() {
    this._winInstSvc.onChange.subscribe((count) => {
      let mi = this.getMenuItemByStrId("DashAppsOpenedComponent");

      let inactive = _.filter(this._winInstSvc.instances, (i) => {
        return !i.parentWin.visible;
      });

      mi.messages = inactive.length;
    })
  }

  @ViewChild('content', { read: ViewContainerRef })
  public content: ViewContainerRef;

  public collapsed = true;

  public contentTypeOpened?: Type<any> = null;
  private actComponent: ComponentRef<any>;

  private menuCloser = new MenuCloser(this);

  public menuItems: DashboardMenuItemVM[] = [];

  public toggleFullscreen() {

    let isFullscreen = !window.screenTop && !window.screenY;
    //!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement

    let docElem: any = document.documentElement;
    let doc: any = document;

    if (isFullscreen) {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
    } else {
      if (docElem.requestFullscreen) {
        docElem.requestFullscreen();
      } else if (docElem.msRequestFullscreen) {
        docElem.msRequestFullscreen();
      } else if (docElem.mozRequestFullScreen) {
        docElem.mozRequestFullScreen();
      } else if (docElem.webkitRequestFullscreen) {
        let elem: any = Element;
        docElem.webkitRequestFullscreen(elem.ALLOW_KEYBOARD_INPUT);
      }
    }
  }

  public showContent(menuItem: DashboardMenuItemVM) {
    if (this.contentTypeOpened === menuItem.type) {
      return;
    }

    if (this.actComponent) {
      this.actComponent.destroy();
    }

    this.contentTypeOpened = menuItem.type;
    this.actComponent = this._createSvc.createInstance(menuItem.type, this.content);
  }

  public dashboardMouseEnter() {
    this.menuCloser.mouseEnter();
  }

  public dashboardMouseLeave() {
    this.menuCloser.mouseLeave();
  }

  public closeMenu() {
    if (this.actComponent) {
      this.actComponent.destroy();
    }
    this.contentTypeOpened = null;
  }

  public expandCollapse() {
    this.collapsed = !this.collapsed;
  }

  private onTaskChange(e: TaskEvent) {
    var i = this.getMenuItemByStrId(e.strId);

    if (e.started) {
      i.tasks++;
    } else {
      i.tasks--;
    }
  }

  private getMenuItemByStrId(strId: string) {
    return _.find(this.menuItems, { strId: strId });
  }

}

export class DashboardMenuItem {
  type: Type<any>;
  title: string;
  icon: string;
}

export class DashboardMenuItemVM {
  public type: Type<any>;
  public strId: string;
  public title: string;
  public icon: string;
  public tasks?= 0;
  public messages?= 0;
}
