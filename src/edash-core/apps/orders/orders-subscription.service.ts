
import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { LightstreamerService } from "../../services/lightstreamer.service";
import { ISubscriptionObj } from "../quote-page/quote-page-subscription.service";
import { UserInfoService } from "../../services/user-info.service";

declare var Lightstreamer;

@Injectable()
export class OrdersSubscriptionService {

    constructor(private _userInfoSvc: UserInfoService, private _lsSvc: LightstreamerService) {
     
    }

    public onItemUpdate = new Subject<ISubscriptionObj>();

    private subscription;

    public subscribe() {

        let subscriptionKey = `olc;${this._userInfoSvc.response.customer_id}`
         

        let fieldList = [
            'key'
            , 'command'
            , 'o_id'
            , 'o_buyside'
            , 'o_qty'
            , 'i_vtp'            
            , 'i_symbol'
            , 'o_value'            
            , 'o_expires'
            , 'o_created'
            , 'c_name'
            , 'o_price'
            , 'o_state'
            , 'i_type'
            , 'e_name'
            , 'o_type'
            , 'o_remarks'
        ];

        this.subscription = new Lightstreamer.Subscription("COMMAND", subscriptionKey, fieldList);
        this.subscription.setDataAdapter("QUOTER");
        this.subscription.setRequestedSnapshot("yes");
        this.subscription.addListener({
            onItemUpdate: (dataObj) => {
                this.onItemUpdate.next(dataObj);                
            }            
        });

        this._lsSvc.connection.subscribe(this.subscription);
    }

    public unsubscribe() {
        let isActive = this.subscription.isActive();
        if (isActive) {
            this._lsSvc.connection.unsubscribe(this.subscription);
        }
    }


}