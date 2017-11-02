import { Component, ViewEncapsulation, OnInit, ViewChild, ViewContainerRef } from "@angular/core";

import { WinDragging } from "./dragResize/WinDragging";
import { WinResizing, ResizeDirection } from "./dragResize/WinResizing";

import { MdlgCreationService } from "./services/mdlg-creation.service";
import { WinCreationService } from "./services/win-creation.service";
import { DynamicCreationService } from "./services/dynamic-creation.service";
import { ResizeGridDrawer } from "./dragResize/GridResizing";
import { GridDockingConsts } from "./dragResize/GridDockingConsts";
import { PluginsConfig } from "../config/plugins-config";
import { LayoutSize } from "../common/globals";
import { Utils } from "../common/Utils";

import * as moment from "moment";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',

  host: {
    '(window:resize)': 'onResize($event)',
    
  },
  encapsulation: ViewEncapsulation.None 
})


export class AppComponent implements OnInit {

  public ngOnInit() {
    this._winCreateService.windowTarget = this.windowTarget;
    this._dlgCreateService.dlgTarget = this.windowAll;
    this._gridResizer.onRootComponentLoaded();

    this.createPlugins();    

    moment.locale("de");    
  }


  constructor(    
    private _winCreateService: WinCreationService,
    private _dlgCreateService: MdlgCreationService,
    private _dCreateSvc: DynamicCreationService,    
    private _gridResizer: ResizeGridDrawer,    
  ) {

    this.resetResponsivity();
  }

  @ViewChild('content', { read: ViewContainerRef }) 
  windowTarget: ViewContainerRef;

  @ViewChild('windowAll', { read: ViewContainerRef }) 
  windowAll: ViewContainerRef;

  @ViewChild('plugins', { read: ViewContainerRef }) 
  pluginsTarget: ViewContainerRef;
  



  public responsiveClass = "";
  public menuOpenedClass = "";

  public currentSize?: LayoutSize;

  private mobileTreshold = 600;
  private menuClosingClass = "closed";

  public gridConsts = GridDockingConsts;

  private createPlugins() {
    PluginsConfig.plugins.forEach((plugin) => {
      this._dCreateSvc.createInstance(plugin, this.pluginsTarget);
    })
  }

  public onResize(e) {
    this.resetResponsivity();

    this._gridResizer.onBackgroundSizeChanged();    
  }

  

  private resetResponsivity() {
    this.recognizeWidth();

    this.responsiveClass = this.currentSize === LayoutSize.Mobile ? "mobile-resp" : "web-resp";
  }

  private recognizeWidth() {
    var newSize: LayoutSize;

    if (window.innerWidth < this.mobileTreshold) {
      newSize = LayoutSize.Mobile;
    } else {
      newSize = LayoutSize.Web;
    }

    if (this.currentSize != newSize) {
      this.currentSize = newSize;
      this.onLayoutSizeChanged();
    }
  }

  public switchMenuVisibility() {
    this.menuOpenedClass = this.menuOpenedClass === this.menuClosingClass ? "" : this.menuClosingClass;
  }

  public onLayoutSizeChanged() {
    if (this.currentSize === LayoutSize.Mobile) {
      this.menuOpenedClass = this.menuClosingClass;
    }
  }

  public mouseMove(e: MouseEvent) {

    this.handleWinDragging(e);
    this.handleWinResizing(e);
  }

  private handleWinDragging(e: MouseEvent) {
    if (WinDragging.isDragging) {
      e.preventDefault();

      let win = WinDragging.currentWin;

      let newLeft = e.clientX - WinDragging.dragMouseOffsetX;
      let newTop = e.clientY - WinDragging.dragMouseOffsetY;

      let minLeft = 60;
      let maxLeft = document.documentElement.clientWidth - win.width;

      let minTop = 0;
      let maxTop = document.documentElement.clientHeight - win.height;

      newLeft = Utils.assureRange(newLeft, minLeft, maxLeft);
      newTop = Utils.assureRange(newTop, minTop, maxTop);

      win.left = newLeft;
      win.top = newTop;

      this._gridResizer.onWinDragChange();
    }
  }

  private handleWinResizing(e: MouseEvent) {
    if (WinResizing.isResizing) {
      e.preventDefault();

      let win = WinResizing.currentWin;

      if (WinResizing.horizontal) {

        if (WinResizing.horizontalDir === ResizeDirection.rightHalf) {

          let newWidth = e.clientX - win.left;

          newWidth = Utils.assureRange(newWidth, win.minWidth, null);
          win.width = newWidth;

        }

        if (WinResizing.horizontalDir === ResizeDirection.leftHalf) {

          let diff = WinResizing.winLeft - e.clientX;

          let newWidth = WinResizing.winWidth + diff;
          let newLeft = WinResizing.winLeft - diff;

          let isValid = true;

          if (newWidth < win.minWidth) {
            newWidth = win.minWidth;
            isValid = false;
          }

          win.width = newWidth;

          if (isValid) {
            win.left = newLeft;
          }

        }

      }

      if (WinResizing.vertical) {

        if (WinResizing.verticalDir === ResizeDirection.rightHalf) {
          let newHeight = e.clientY - win.top;

          newHeight = Utils.assureRange(newHeight, win.minHeight, null);
          win.height = newHeight;
        }

        if (WinResizing.verticalDir === ResizeDirection.leftHalf) {
          let diff = WinResizing.winTop - e.clientY;

          let newHeight = WinResizing.winHeight + diff;

          let isValid = true;

          if (newHeight < win.minHeight) {
            newHeight = win.minHeight;
            isValid = false;
          }

          win.height = newHeight;

          if (isValid) {
            let newTop = WinResizing.winTop - diff;
            win.top = newTop;
          }
        }

      }

      win.onResized();

      this._gridResizer.onWinResizeChange();
    }
  }



  public mouseUp(e: MouseEvent) {

    if (WinDragging.isDragging) {
      this._gridResizer.onWinDragEnd();
    }

    if (WinResizing.isResizing) {
      this._gridResizer.onWinResizeEnd();
    }

    WinDragging.isDragging = false;
    WinResizing.isResizing = false;

    
  }


}