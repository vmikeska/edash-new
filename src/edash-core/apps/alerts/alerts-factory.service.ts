import { Injectable } from "@angular/core";
import { AppBuildingService } from "../../../desktop/services/app-building.service";
import { AlertsComponent } from "./alerts.compoment";


@Injectable()
export class AlertsFactoryService {

    constructor(private _winBuildSvc: AppBuildingService) {

    }

    public instance(params: any = null) {
        let insts = this._winBuildSvc.activateWin<AlertsComponent>(AlertsComponent, (inst) => {
            inst.isSingleton = true;
        },
            (inst) => {
                inst.title = "Alerts";
                this._winBuildSvc.buildWinModel(inst, 600, 400)
            }
        );
        return insts;
    }


}