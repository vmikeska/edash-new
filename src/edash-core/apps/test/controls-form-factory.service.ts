import { Injectable } from "@angular/core";
import { AppBuildingService } from "../../../desktop/services/app-building.service";
import { ControlsFormComponent } from "./controls-form.component";




@Injectable()
export class ControlsFormFactoryService {

    constructor(private _winBuildSvc: AppBuildingService) {

    }

    public instance(params: any = null) {
        let insts = this._winBuildSvc.activateWin<ControlsFormComponent>(ControlsFormComponent, (inst) => {
            inst.isSingleton = true;
        },
            (inst) => {
                inst.title = "Test";
                this._winBuildSvc.buildWinModel(inst, 600, 400)
            }
        );
        return insts;
    }


}