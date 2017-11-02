import { Component, AfterViewInit, ViewEncapsulation, Output, ViewChild, EventEmitter, ViewContainerRef, ComponentRef, ElementRef } from "@angular/core";
import { WinInstanceService } from "../services/win-instance.service";
import { ResizeGridDrawer } from "../dragResize/GridResizing";
import { WinContentBase } from "./win-content-base";
import { Utils } from "../../common/Utils";
import { WinDragging } from "../dragResize/WinDragging";
import { LayoutSize, $ } from "../../common/globals";
import { WinResizing, ResizeDirection } from "../dragResize/WinResizing";




// import { $ } from "app/utils/globals";

@Component({
  selector: 'app-win',
  templateUrl: './base-window.html',
  encapsulation: ViewEncapsulation.None,
})

export class AppWin implements AfterViewInit{
  

  public ngAfterViewInit() {
    this.intElementResizeBase();
    this.recalFixedElements();
    this.resizeElements();

    setTimeout(() => {
      this._winInstSvc.createThumb(this.contentComponent);
    }, 100);

  }

  constructor(
    private _winInstSvc: WinInstanceService,
    private _gridResizer: ResizeGridDrawer
  ) {

  }

  @Output()
  public heightChanged = new EventEmitter<number>();

  @Output()
  public sizeChanged = new EventEmitter();

  @ViewChild('content', { read: ViewContainerRef })
  public content: ViewContainerRef;

  @ViewChild('win')
  public win;

  

  public componentRef: ComponentRef<AppWin>;
  public contentComponent: WinContentBase;

  public contentComponentRef: ComponentRef<WinContentBase>;

  public contentElement;

  private visibleLoc = true;
  private visibleTempLoc = false;

  public set visibleTemp(visible: boolean) {
    this.visibleTempLoc = visible
    this._winInstSvc.emitChange();
  } 

  public get visibleTemp() {
    return this.visibleTempLoc;
  }

  public get visible() {
    return this.visibleLoc;
  }

  public set visible(v) {
    this.visibleLoc = v;
    this.visibleTempLoc = false;
    this._winInstSvc.emitChange();
  }

  public minWidthInt = 480;
  public minHeightInt = 300;

  public get minWidth() {
    return this.minWidthInt;
  }

  public get minHeight() {
    return this.minHeightInt;
  }

  public set minWidth(v: number) {
    this.minWidthInt = v;
    this.width = v;
  }

  public set minHeight(v: number) {
    this.minHeightInt = v;
    this.height = v;
  }


  public id = Utils.randomString(20,"aA");
  public title: string;

  public left = 1;
  public top = 1;

  public width = this.minWidth;
  public height = this.minHeight;

  public zIndex = 0;
  public topWindow = false;

  private staticHeight = 0;
  private fixedElements;
  private dynamicElements;

  public show(show: boolean, makeThumb = false) {

    if (!show) {
      if (makeThumb) {
        this._winInstSvc.createThumb(this.contentComponent);
      }
    }

    this.visible = show;
  }

  public winMouseDown(e) {
    if (!this.topWindow) {
      this._winInstSvc.bringInstanceToFront(this.contentComponent);      
    }
  }

  public mouseDown(e: MouseEvent) {
    WinDragging.isDragging = true;
    WinDragging.dragMouseOffsetX = e.offsetX;
    WinDragging.dragMouseOffsetY = e.offsetY;
    WinDragging.currentWin = this;

    this._gridResizer.onWinDragStart();
  }

  public close(e) {
    e.preventDefault();
    this.closeWin();
  }

  public closeWin() {
    if (this.contentComponent.onBeforeClose) {
      this.contentComponent.onBeforeClose();
    }

    this.componentRef.destroy();
    this.contentComponentRef.destroy();
    this._winInstSvc.remove(this.contentComponent);
  }

  public minimize(e) {
    e.preventDefault();
    this.show(false, true);
  }

  public layoutChanged(newSize: LayoutSize) {

  }

  public onResized() {
    this.resizeElements();

    this.sizeChanged.emit();
  }

  public resizerStart(e: MouseEvent, horizontal: boolean, vertical: boolean, horizontalDir: ResizeDirection, verticalDir: ResizeDirection) {

    WinResizing.isResizing = true;
    WinResizing.currentWin = this;

    WinResizing.horizontal = horizontal;
    WinResizing.vertical = vertical;

    WinResizing.horizontalDir = horizontalDir;
    WinResizing.verticalDir = verticalDir;

    WinResizing.winLeft = this.left;
    WinResizing.winTop = this.top;
    WinResizing.winWidth = this.width;
    WinResizing.winHeight = this.height;

    this._gridResizer.onWinResizeStart();
  }

  public excludeBlock(element: ElementRef, exclude: boolean) {
    let elem = element.nativeElement;
    let $elem = $(elem);

    elem.setAttribute("data-excluded", exclude);

    if (exclude) {
      $elem.addClass("hidden");
    } else {
      $elem.removeClass("hidden");
    }

    this.recalFixedElements();
    this.resizeElements();
  }

  private intElementResizeBase() {
    var resElm = this.componentRef.instance.content.element;

    var winElm = resElm.nativeElement.parentElement;
    this.contentElement = winElm;

    this.fixedElements = this.contentElement.getElementsByClassName("size-fixed");
    this.dynamicElements = this.contentElement.getElementsByClassName("size-dynamic");
  }

  public recalFixedElements() {

    let newStaticHeight = 0;

    for (let af = 0; af <= this.fixedElements.length - 1; af++) {
      let element = this.fixedElements[af];

      let height = parseInt(element.getAttribute("data-height"));

      let excluded = Utils.parseBool(element.getAttribute("data-excluded"));

      if (!excluded) {
        newStaticHeight += height;
      }

      element.style.height = `${height}px`;
    }

    this.staticHeight = newStaticHeight;
  }

  public resizeElements() {
    var ch = this.contentElement.clientHeight;

    var dynamicHeightTotal = ch - this.staticHeight;

    for (let af = 0; af <= this.dynamicElements.length - 1; af++) {
      let element = this.dynamicElements[af];

      let heightIndex = parseFloat(element.getAttribute("data-height"));

      let height = dynamicHeightTotal * heightIndex;

      element.style.height = `${height}px`;
    }

    this.heightChanged.emit(ch);
  }



}

