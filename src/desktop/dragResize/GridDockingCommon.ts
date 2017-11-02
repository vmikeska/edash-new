import { GridDockingConsts } from "./GridDockingConsts";
import { Dimensions, GridPosition } from "./position-classes";

export class GridDockingCommon {
    
        public static getHighlightAreaRect(left, top, width, height) {
            let dim: Dimensions = {
                xFrom: left,
                xTo: left + width,
                yFrom: top,
                yTo: top + height
            }
            return dim;
        }
    
        public static roundValue(roughVal: number) {
            let wholeBlocks = Math.floor(roughVal / GridDockingConsts.rectWithGapPx);
            let newLength = (wholeBlocks * GridDockingConsts.rectWithGapPx) - GridDockingConsts.gapPx;
            return newLength;
        }
    
        public static getLeftTopPxByCoordinates(x: number, y: number) {
            let left = GridDockingConsts.xOffset + (GridDockingConsts.rectWithGapPx * x);
            let top = GridDockingConsts.yOffset + (GridDockingConsts.rectWithGapPx * y);
    
            return {left, top};
        }
    
        public static getLocationByPx(x, y, isLeftTop) {
            let realX = x - GridDockingConsts.xOffset;
            let realY = y - GridDockingConsts.yOffset;
    
            if (!isLeftTop) {
                realX += GridDockingConsts.gapPx;
                realY += GridDockingConsts.gapPx;
            }
    
            let row = Math.floor(realX / GridDockingConsts.rectWithGapPx);
            let col = Math.floor(realY / GridDockingConsts.rectWithGapPx);
    
            let restXrate = (realX % GridDockingConsts.rectWithGapPx) / GridDockingConsts.rectWithGapPx;
            let restYrate = (realY % GridDockingConsts.rectWithGapPx) / GridDockingConsts.rectWithGapPx;
    
            let coversLeftPart = (restXrate < 0.5);
            let coversTopPart = (restYrate < 0.5)
    
            if (isLeftTop) {
                if (!coversLeftPart) {
                    row++;
                }
    
                if (!coversTopPart) {
                    col++;
                }
            }
    
            if (!isLeftTop) {
                if (coversLeftPart) {
                    row--;
                }
    
                if (coversTopPart) {
                    col--;
                }
            }
    
            let res: GridPosition = { row, col };
            return res;
        }
    }