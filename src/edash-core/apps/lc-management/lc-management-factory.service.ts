import { Injectable } from "@angular/core";
import { AppWin } from "../../../desktop/components/base-window.component";
import { AppBuildingService } from "../../../desktop/services/app-building.service";
import { LcManagementComponent } from "./lc-management.component";

@Injectable()
export class LcManagementFactoryService {

    constructor(private _winBuildSvc: AppBuildingService) {

    }

    public instance(params: any = null) {

        let insts = this._winBuildSvc.activateWin<LcManagementComponent>(LcManagementComponent, (inst) => {
            inst.isSingleton = true;
        },
            (inst) => {
                inst.title = "Lastgangmanagement";
                this._winBuildSvc.buildWinModel(inst, 600, 400)
            });

        return insts;
    }


}