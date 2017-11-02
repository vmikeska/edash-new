
import { Injectable } from "@angular/core";
import { AppBuildingService } from "../../../desktop/services/app-building.service";
import { OrdersComponent } from "../orders/orders.component";


@Injectable()
export class OrdersFactoryService {

    constructor(private _winBuildSvc: AppBuildingService) {

    }

    public instance(params: any = null) {
        let insts = this._winBuildSvc.activateWin<OrdersComponent>(OrdersComponent, (inst) => {
            inst.isSingleton = true;
        },
            (inst) => {
                inst.title = "Orders";
                this._winBuildSvc.buildWinModel(inst, 650, 300)
            });

        return insts;
    }


}