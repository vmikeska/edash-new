import { Injectable } from "@angular/core";
import { DelayedReturn } from "../../common/DelayedReturn";
import { Subject } from "rxjs/Subject";

import { AppWin } from "../components/base-window.component";
import { SpaceMangerService } from "./SpaceMangerService";
import { WinDragging } from "./WinDragging";
import { WinResizing } from "./WinResizing";
import { GridDockingCommon } from "./GridDockingCommon";
import { GridDockingConsts } from "./GridDockingConsts";
import { GridPosition } from "./position-classes";
import { Utils } from "../../common/Utils";
import { $ } from "../../common/globals";

@Injectable()
export class ResizeGridDrawer {

    public winCont: HTMLElement;
    public resizingGrid: HTMLElement;

    constructor(private spaceMgr: SpaceMangerService) {
        this.initDelayedResizing();        
    }

    private highlightCls = "highlighted";

    private bckWidth: number;
    private bckHeight: number;

    private delayedResizing: DelayedReturn;

    private lastLeftTop: GridPosition;
    private lastRightBottom: GridPosition;

    private hasMoved = false;
    private hasResized = false;

    private currentWindow: AppWin = null;

    private availableX: number;
    private availableY: number;

    public onResizingStarted = new Subject();
    
    public onResizingFinished = new Subject();

    private initDelayedResizing() {
        this.delayedResizing = new DelayedReturn(700);
        this.delayedResizing.callback = () => {
            this.drawGrid();            
        }
    }

    public onRootComponentLoaded() {
        this.resizingGrid = document.getElementById("resizingGrid");
        this.winCont = document.getElementById("winCont");
        this.drawGrid();
    }

    private get currentWindowElement(): HTMLElement {

        if (!this.currentWindow) {
            return null;
        }
        let winElement = document.getElementById(this.currentWindow.id);
        return winElement;
    }

    public onWinDragStart() {
        this.hasMoved = false;
        this.currentWindow = WinDragging.currentWin;
        this.setWindowOpacity(true);
        this.showResizingGrid(true);

        this.highlightCurrentWindow();
    }

    public onWinDragChange() {
        this.hasMoved = true;
        this.highlightCurrentWindow();
        this.spaceMgr.recalculateAll();
    }

    public onWinDragEnd() {
        this.showResizingGrid(false);
        this.setWindowOpacity(false);

        if (!this.hasMoved) {
            return;
        }

        let size = this.getSizeFromPositionRange(this.lastLeftTop, this.lastRightBottom);

        this.currentWindow.left = size.left;
        this.currentWindow.top = size.top;

        this.unselectAll();
        this.clearLastPosition();
    }

    public onWinResizeStart() {
        this.hasResized = false;
        this.currentWindow = WinResizing.currentWin;

        this.showResizingGrid(true);
        this.setWindowOpacity(true);
        this.highlightCurrentWindow();

        this.onResizingStarted.next();
    }

    public onWinResizeChange() {
        this.hasResized = true;
        this.highlightCurrentWindow();
        this.spaceMgr.recalculateAll();
    }

    public onWinResizeEnd() {
        this.setWindowOpacity(false);
        this.showResizingGrid(false);

        if (!this.hasResized) {
            return;
        }

        let size = this.getSizeFromPositionRange(this.lastLeftTop, this.lastRightBottom);

        this.currentWindow.width = size.width;
        this.currentWindow.height = size.height;
        this.clearLastPosition();

        this.currentWindow.sizeChanged.emit();

        this.onResizingFinished.next();
    }

    private highlightCurrentWindow() {
        this.highlightWindow(this.currentWindow.left, this.currentWindow.top, this.currentWindow.width, this.currentWindow.height);
    }

    private setWindowOpacity(transparent: boolean) {
        let cw = this.currentWindowElement;

        if (!cw) {
            return;
        }

        if (transparent) {
            cw.style.opacity = GridDockingConsts.movingOpacity.toString();;
        } else {
            cw.style.opacity = "1";
        }
    }

    private showResizingGrid(show: boolean) {
        if (!GridDockingConsts.hidingStyle) {
            return;
        }


        let cls = "hidden";

        let $rg = $(this.resizingGrid);

        if (show) {
            $rg.removeClass(cls)
        } else {
            $rg.addClass(cls);
        }
    }

    public onBackgroundSizeChanged() {
        this.cleanChildern();
        this.delayedResizing.call();
    }

    private setDimensions() {
        this.bckWidth = this.winCont.clientWidth;
        this.bckHeight = this.winCont.clientHeight;
    }
        
    public drawGrid() {
        this.setDimensions();

        this.availableX = Math.floor(this.bckWidth / GridDockingConsts.rectWithGapPx) - Math.floor(GridDockingConsts.xOffset / GridDockingConsts.rectWithGapPx) - 1;
        this.availableY = Math.floor(this.bckHeight / GridDockingConsts.rectWithGapPx) - 1;

        this.spaceMgr.setAvailableSpace(this.availableX, this.availableY);

        for (let col = 0; col <= this.availableY; col++) {
            for (let row = 0; row <= this.availableX; row++) {

                let x = GridDockingConsts.xOffset + (row * GridDockingConsts.rectWithGapPx);
                let y = GridDockingConsts.yOffset + (col * GridDockingConsts.rectWithGapPx);

                let div = document.createElement("DIV");
                div.classList.add("rect");

                div.id = this.buildLocId(row, col);

                div.style.width = this.px(GridDockingConsts.rectPx);
                div.style.height = this.px(GridDockingConsts.rectPx);

                div.style.left = this.px(x);
                div.style.top = this.px(y);

                this.resizingGrid.appendChild(div);
            }
        }

    }

    private buildLocId(row, col) {
        return `rect-${row}-${col}`;
    }

    private highlightWindow(left, top, width, height) {
        let dim = GridDockingCommon.getHighlightAreaRect(left, top, width, height);

        let leftTop = GridDockingCommon.getLocationByPx(dim.xFrom, dim.yFrom, true);
        let rightBottom = GridDockingCommon.getLocationByPx(dim.xTo, dim.yTo, false);

        leftTop.col = Utils.assureRange(leftTop.col, 0, null);
        leftTop.row = Utils.assureRange(leftTop.row, 0, null);

        let posSame = this.isPositionSame(leftTop, this.lastLeftTop) && this.isPositionSame(rightBottom, this.lastRightBottom);
        if (posSame) {
            return;
        }

        this.unselectAll();

        this.highlightArea(leftTop.row, rightBottom.row, leftTop.col, rightBottom.col);

        this.lastLeftTop = leftTop;
        this.lastRightBottom = rightBottom;
    }

    private clearLastPosition() {
        this.lastLeftTop = null;
        this.lastRightBottom = null;
    }

    private isPositionSame(pos1: GridPosition, pos2: GridPosition) {

        if (!pos1 || !pos2) {
            return false;
        }

        let same = pos1.col === pos2.col && pos1.row === pos2.row;
        return same;
    }

    private highlightArea(fromRow, toRow, fromCol, toCol) {
        for (let row = fromRow; row <= toRow; row++) {
            for (let col = fromCol; col <= toCol; col++) {

                let id = this.buildLocId(row, col);
                let elem = document.getElementById(id);

                if (!elem) {
                    return;
                }

                $(elem).addClass(this.highlightCls);
            }
        }
    }

    private getSizeFromPositionRange(leftTop: GridPosition, rightBottom: GridPosition) {
        let rowDiff = (rightBottom.row - leftTop.row) + 1;
        let colDiff = (rightBottom.col - leftTop.col) + 1;

        let width = (rowDiff * GridDockingConsts.rectWithGapPx) - GridDockingConsts.gapPx;
        let height = (colDiff * GridDockingConsts.rectWithGapPx) - GridDockingConsts.gapPx;

        let left = (leftTop.row * GridDockingConsts.rectWithGapPx) + GridDockingConsts.xOffset;
        let top = (leftTop.col * GridDockingConsts.rectWithGapPx) + GridDockingConsts.yOffset;

        return { left, top, width, height };
    }

    private unselectAll() {
        let items = this.resizingGrid.getElementsByClassName(this.highlightCls);
        let rects = Array.from(items);

        rects.forEach(rect => {
            $(rect).removeClass(this.highlightCls);
        });
    }

    private cleanChildern() {
        while (this.resizingGrid.firstChild) {
            this.resizingGrid.removeChild(this.resizingGrid.firstChild);
        }
    }

    private px(val: number) {
        return `${val}px`;
    }

}







