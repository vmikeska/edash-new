
import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";

import * as _ from "lodash";
import { LightstreamerService } from '../../services/lightstreamer.service';


declare var Lightstreamer: any;

@Injectable()
export class QuotePageSubscriptionService {

    constructor(private _lightSvc: LightstreamerService) {

    }

    private instances: SubscriptionSvcInstance[] = [];


    public getOrCreateInstance(instanceId) {
        let instance = _.find(this.instances, { instanceId: instanceId });
        if (!instance) {
            instance = new SubscriptionSvcInstance(this._lightSvc, instanceId);
            this.instances.push(instance);            
        }

        return instance;
    }

    //todo: destroy instance

}

export class SubscriptionSvcInstance {

    public instanceId: string;

    private _lightSvc: LightstreamerService;

    constructor(lightSvc: LightstreamerService, instanceId: string) {
        this._lightSvc = lightSvc;
        this.instanceId = instanceId;
        this.createSubscription();
    }

    public instrumentKeys: string[] = [];

    public subscription;

    public onItemUpdate = new Subject<InsturmentUpdateEvent>();


    public subscribeOne(instrumentKey) {
        this.unsubscribe();
        let instrs = this.instrumentKeys.concat(instrumentKey);
        this.subscribe(instrs);
    }

    public unsubscribeOne(instrumentKey) {
        this.unsubscribe();
        _.pull(this.instrumentKeys, instrumentKey);
        this.subscribe(this.instrumentKeys);
    }

    public unsubscribe(removeKeys = false) {
        let isActive = this.subscription.isActive();
        if (isActive) {
            this._lightSvc.connection.unsubscribe(this.subscription);
        }

        if (removeKeys) {
            this.instrumentKeys = [];
        }
    }

    public subscribe(instruments) {
        let hasInstruments = instruments.length > 0;

        if (hasInstruments) {
            this.subscription.setItems(instruments);
            this._lightSvc.connection.subscribe(this.subscription);
        }
    }

    private subscribeInstr() {
        this._lightSvc.connection.subscribe(this.subscription);
    }

    private createSubscription() {

        let subscribeFields = ["cumqty", "trades", "low", "high", "open", "last_time", "last_price", "last_qty",
            "bid_qty", "bid_price", "ask_price", "ask_qty"];

        //todo: was always sending empty ?
        let instrKeys = [];

        this.subscription = new Lightstreamer.Subscription("MERGE", instrKeys, subscribeFields);
        this.subscription.setDataAdapter("QUOTER");
        this.subscription.setRequestedSnapshot("yes");
        this.subscription.addListener({
            onItemUpdate: (data: ISubscriptionObj) => {

                let instrKey = data.getItemName();
                let hasKey = this.instrumentKeys.includes(instrKey);

                if (!hasKey) {
                    this.instrumentKeys.push(instrKey);
                }

                let evnt: InsturmentUpdateEvent = {
                    isNew: !hasKey,
                    data: data
                };

                this.onItemUpdate.next(evnt);

            }
        });

    }

}

export class InsturmentUpdateEvent {
    public isNew: boolean;
    public data: ISubscriptionObj;
}


export interface ISubscriptionObj {
    isSnapshot();
    getValue(name: string);
    forEachChangedField(callback: (name, pos, value) => void);

    //forEachField
    getItemName();
    //getItemPos
    //isValueChanged
}
