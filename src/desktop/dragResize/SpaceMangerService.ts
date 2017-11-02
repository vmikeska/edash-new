import { Injectable } from "@angular/core";
import { WinInstanceService } from "../services/win-instance.service";
import { AppWin } from "../components/base-window.component";

import * as _ from "lodash";
import { GridDockingCommon } from "./GridDockingCommon";
import { GridDockingConsts } from "./GridDockingConsts";
import { GridPosition } from "./position-classes";

@Injectable()
export class SpaceMangerService {
    public space: boolean[][];

    public allItems: SpaceItem[] = [];

    public availableX = 0;
    public availableY = 0;

    constructor(private winInstances: WinInstanceService) {

    }

    public setAvailableSpace(availableX: number, availableY: number) {
        this.availableX = availableX;
        this.availableY = availableY;

        this.winInstances.onChange.subscribe(() => {
            this.recalculateAll();
        });

        this.recalculateAll();
    }

    public recalculateAll() {
        this.allItems = [];

        this.createSpaceItemObjects();

        this.recalculateUsedSpace(this.availableY, this.availableX)
    }

    private createSpaceItemObjects() {

        let instances = _.filter(this.winInstances.instances, (i) => {
            let involved = i.parentWin.visible;
            return involved;
        })

        instances.forEach((wc) => {

            let pw = wc.parentWin;

            let dim = GridDockingCommon.getHighlightAreaRect(pw.left, pw.top, pw.width, pw.height);

            let leftTop = GridDockingCommon.getLocationByPx(dim.xFrom, dim.yFrom, true);
            let rightBottom = GridDockingCommon.getLocationByPx(dim.xTo, dim.yTo, false);

            let si: SpaceItem = {
                leftTop, 
                rightBottom,
                win: pw
            };

            this.allItems.push(si);
        })
    }

    private recalculateUsedSpace(rows, cols) {
        this.initField(rows, cols);

        this.allItems.forEach((i) => {
            this.markSingleWindow(i.leftTop, i.rightBottom);
        })

        if (GridDockingConsts.spaceManagerLogging) {
            this.consoleDisplay();
        }
    }

    private consoleDisplay() {
        console.clear();
        let act = 0;
        this.space.forEach((row) => {
            let str = "";
            row.forEach((col) => {
                str += (col ? "■" : "0");
            })
            console.log(str + "-" + act);
            act++;
        })
    }

    private initField(rows, cols) {
        this.space = [];
        for (let r = 0; r <= rows; r++) {

            this.space[r] = [];
            for (let c = 0; c <= cols; c++) {
                this.space[r][c] = false;
            }

        }
    }

    private markSingleWindow(leftTop: GridPosition, rightBottom: GridPosition) {
        for (let row = leftTop.row; row <= rightBottom.row; row++) {
            for (let col = leftTop.col; col <= rightBottom.col; col++) {                
                this.space[col][row] = true;                
            }
        }
    }

    public findAvailableSpace(rowsNeeded: number, colsNeeded: number) {

        let foundInitialRow = false;

        let actRowNo = 0;
        let consideredRowNow = 0;

        let lastColIndex = 0;

        let maxRowNo = this.space.length -1;

        while (actRowNo <= maxRowNo) {

            if (foundInitialRow) {

                let toRow = consideredRowNow + rowsNeeded - 1;

                if (toRow > maxRowNo) {
                    return null;
                }

                let allRowsOk = true;
                for (let ar = actRowNo; ar <= toRow; ar++) {

                    let rowOk = this.isSpaceOnRowAvailable(ar, lastColIndex, colsNeeded);
                    if (!rowOk) {
                        foundInitialRow = false;
                        allRowsOk = false;
                        break;
                    }
                }

                if (allRowsOk) {                    
                    let res = { row: consideredRowNow, col: lastColIndex };
                    return res;
                }

            } else {
                let rowResult = this.findSpaceOnRow(actRowNo, colsNeeded);
                if (rowResult.found) {
                    foundInitialRow = true;
                    lastColIndex = rowResult.startIndex;
                }
            }

            consideredRowNow = actRowNo;
            actRowNo++;
        }

        return null;
    }

    private isSpaceOnRowAvailable(rowNo: number, cellStart: number, cellsCount: number) {
        let cellEnd = cellStart + cellsCount - 1;
        let row = this.space[rowNo];
        for (let ac = cellStart; ac <= cellEnd; ac++) {
            let available = !row[ac];
            if (!available) {
                return false;
            }
        }

        return true;
    }

    private findSpaceOnRow(row: number, cellsNeeded: number) {
        let cellsAvailable = 0;
        let foundFirst = false;
        let found = false;
        let rowArray = this.space[row];
        let startIndex = null;

        for (let act = rowArray.length - 1; act >= 0; act--) {
            let actCell = rowArray[act];
            let isEmpty = !actCell;

            if (!foundFirst && isEmpty) {
                foundFirst = true;
                cellsAvailable = 0;                
            }

            if (foundFirst) {
                cellsAvailable++
            }

            let enoughSpace = cellsAvailable >= cellsNeeded;
            if (enoughSpace) {
                startIndex = act;
                found = true;
                break;
            }
        }

        return {
            found,
            startIndex
        };
    }
}

export class SpaceItem {
    leftTop: GridPosition;
    rightBottom: GridPosition;
    win: AppWin;
}
