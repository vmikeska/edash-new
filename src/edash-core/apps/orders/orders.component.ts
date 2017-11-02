import { Component } from "@angular/core";
import * as moment from 'moment';
import { WinContentBase } from "../../../desktop/components/win-content-base";
import { OrdersSubscriptionService } from "./orders-subscription.service";
import { MdlgCreationService } from "../../../desktop/services/mdlg-creation.service";
import { ApiCommService } from "../../services/api-comm.service";
import { ExternalTransactionDlgComponent } from "./external-transaction-dlg.component";



@Component({
    selector: 'orders',
    templateUrl: './orders.html',
})

export class OrdersComponent extends WinContentBase {

    constructor(
        private _ordersSubscriptionSvc: OrdersSubscriptionService,
        private _mdlgSvc: MdlgCreationService,
        private _apiComm: ApiCommService
    ) {
        super();

    }

    public extTransClick() {
        this._mdlgSvc.createInst<ExternalTransactionDlgComponent>(ExternalTransactionDlgComponent,
            (m) => {

            },
            (m) => {
                m.title = "External transaction";

                m.buttonsManager.addCloseButton();                
            }
        );
    }

    public exportClick() {        
        let today = moment();
        let dateString = today.format("DDMMYYYY");
        
        let url = this._apiComm.getApiUrl(`order/executed/${dateString}.csv`);
        window.location.href = url;
    }

    public displayingActive = true;

    public handleChange(active) {
        this.displayingActive = active;
    }

    public onBeforeClose() {
        this._ordersSubscriptionSvc.unsubscribe();
    }
}



