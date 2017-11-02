import { Injectable } from "@angular/core";
import { AppBuildingService } from "../../../desktop/services/app-building.service";
import { MarketNewsComponent } from "./market-news.component";



@Injectable()
export class MarketNewsFactoryService {

    constructor(private _winBuildSvc: AppBuildingService) {

    }

    public instance(params: any = null) {

        let insts = this._winBuildSvc.activateWin<MarketNewsComponent>(MarketNewsComponent, (inst) => {
            inst.isSingleton = true;
        },
            (inst) => {
                inst.title = "Market news";
                this._winBuildSvc.buildWinModel(inst, 400, 400)
            });

        return insts;
    }


}