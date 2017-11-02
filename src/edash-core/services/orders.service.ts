
import { Injectable } from '@angular/core';
import { LightstreamerService } from './lightstreamer.service';
import { ApiCommService, ResponseType } from './api-comm.service';
import { NotificationService, MessagesImportance } from './notification.service';

@Injectable()
export class OrdersService {

    constructor(
        private _lsSvc: LightstreamerService, 
        private _commSvc: ApiCommService,
        private _notifSvc: NotificationService,    
    ) { }

    public placeOrder(data: OrderRequest) {

        if (this._lsSvc.isServerOnline) {
            let url = "order/create";

            this._commSvc.apiPutAsync(url, data, true, ResponseType.TXT)
                .then((result) => {
                    //this.transfer_order(result);
                    //todo: something with transfering order
                })
                .catch((result) => {
                    if (result.status == 400) {
                        this._notifSvc.addMessage("Server communication error", result._body, MessagesImportance.Error);
                    }
                })

        } else {
            this._notifSvc.addMessage("Real-time server error", "Realtime-Server disconnected! No orders possible", MessagesImportance.Error);
        }

    }
}


export class OrderRequest {
    i: number;
    e: number;
    buyside: boolean;
    type: string;
    deliverHours: number;
    minAmount: number;
    maxAmount: number;
    limit: number;
    quantity: number;
    Value: number;
    instrKey: string;
    ask: number;
    bid: number;
    expires: string;
    //"expires":"2017-6-26 17:0"
}
