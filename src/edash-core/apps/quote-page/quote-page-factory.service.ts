import { Injectable } from "@angular/core";
import { AppBuildingService } from "../../../desktop/services/app-building.service";
import { QuotePageComponent } from "../quote-page/quote-page.component";



@Injectable()
export class QuotePageFactoryService {

    constructor(private _winBuildSvc: AppBuildingService) {

    }

    public instance(params: any = null) {

        let insts = this._winBuildSvc.activateWin<QuotePageComponent>(QuotePageComponent,
            (inst) => {
                inst.isSingleton = false;
            },
            (inst) => {
                inst.title = "Quote page";
                this._winBuildSvc.buildWinModel(inst, 600, 400)
            });

            return insts;
    }


}