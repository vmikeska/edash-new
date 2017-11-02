import { Injectable } from "@angular/core";
import { AppBuildingService } from "../../../desktop/services/app-building.service";
import { EodDataComponent } from "../eod-data/eod-data.compoment";



@Injectable()
export class EodFactoryService {

    constructor(private _winBuildSvc: AppBuildingService) {

    }

    public instance(params: any = null) {
        let insts = this._winBuildSvc.activateWin<EodDataComponent>(EodDataComponent, (inst) => {
            inst.isSingleton = false;
        },
            (inst) => {
                inst.title = "EOD data";
                this._winBuildSvc.buildWinModel(inst, 600, 400)
            });
        return insts;
    }


}