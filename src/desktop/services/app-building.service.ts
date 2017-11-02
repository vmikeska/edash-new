import { Injectable, Type } from "@angular/core";
import { WinCreationService } from "./win-creation.service";
import { WinInstanceService } from "./win-instance.service";
import { SpaceMangerService } from "../dragResize/SpaceMangerService";
import { AppWin } from "../components/base-window.component";
import { WinContentBase } from "../components/win-content-base";
import { GridDockingCommon } from "../dragResize/GridDockingCommon";
import { GridDockingConsts } from "../dragResize/GridDockingConsts";



@Injectable()
export class AppBuildingService {

    constructor(
        private _winCreateService: WinCreationService,
        private _winInstSvc: WinInstanceService,
        private _spaceMgrSvc: SpaceMangerService
    ) {

    }

    public buildWinModel(model: AppWin, minWidth: number, minHeight: number) {
        let minWidthRounded = GridDockingCommon.roundValue(minWidth);
        let minHeightRounded = GridDockingCommon.roundValue(minHeight);

        let rowsNeeded = Math.round(minHeightRounded / GridDockingConsts.rectWithGapPx);
        let colsNeeded = Math.round(minWidthRounded / GridDockingConsts.rectWithGapPx);

        let col = 0;
        let row = 0;

        let spaceRes = this._spaceMgrSvc.findAvailableSpace(rowsNeeded, colsNeeded);

        if (!spaceRes) {
            col = (this._spaceMgrSvc.availableX - colsNeeded) / 2;
            row = (this._spaceMgrSvc.availableY - rowsNeeded) / 2;
        } else {
            col = spaceRes.col;
            row = spaceRes.row;
        }

        let coords = GridDockingCommon.getLeftTopPxByCoordinates(col, row);

        model.minWidth = minWidthRounded;
        model.minHeight = minHeightRounded;

        model.left = coords.left;
        model.top = coords.top;
    }

    public activateWin<T extends WinContentBase>(
        t: Type<T>,
        initCompModel: (model: T) => void = null,
        initWinModel: (model: AppWin) => void = null) {

        let canCreate = this._winInstSvc.canCreate(t);

        if (canCreate) {
            let instances = this._winCreateService.createWinInst<T>(t,
                (inst) => {
                    if (initCompModel) {
                        initCompModel(inst);
                    }
                },
                (inst) => {
                    inst.title = name;

                    if (initWinModel) {
                        initWinModel(inst);
                    }
                });

            let inst = instances.contentInstance;

            this._winInstSvc.add(inst);
            this._winInstSvc.bringInstanceToFront(inst);

            return inst;
        }

        let inst = this._winInstSvc.getInstance(t)
        inst.parentWin.show(true);
        this._winInstSvc.bringInstanceToFront(inst);
        return inst;
    }
}

