
import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";

import * as _ from "lodash";
import * as moment from 'moment';
import { LightstreamerService } from '../../services/lightstreamer.service';


declare var Lightstreamer: any;

@Injectable()
export class RtChartSubscriptionService {

    constructor(private _lightSvc: LightstreamerService) {

    }

    private instances: RtSubscriptionSvcInstance[] = [];


    public getOrCreateInstance(instanceId, exchangeId, instrumentId) {
        let instance = _.find(this.instances, { instanceId: instanceId });
        if (!instance) {
            instance = new RtSubscriptionSvcInstance(this._lightSvc, instanceId, exchangeId, instrumentId);
            this.instances.push(instance);
        }

        return instance;
    }

    public unsubscrible(instanceId) {
        let instance = _.find(this.instances, { instanceId: instanceId });

        if (instance) {
            instance.unsubscribe();
            this.instances = _.reject(this.instances, (i) => { i.instanceId === instanceId });
        }
    }

}

export class RtSubscriptionSvcInstance {

    constructor(lightSvc: LightstreamerService, instanceId: string, exchangeId, instrumentId) {
        this._lightSvc = lightSvc;

        this.instanceId = instanceId;
        this.exchangeId = exchangeId;
        this.instrumentId = instrumentId

        this.createSubscription();
    }

    public instanceId: string;
    private exchangeId;
    private instrumentId;

    private _lightSvc: LightstreamerService;

    public onItemUpdate = new Subject<RtChartOnUpdateEvent>();

    public subscription;


    private createSubscription() {

        let subscriptionKey = `i;${this.exchangeId};${this.instrumentId}`;
        let subscribedFields = ['last_time', 'last_price', 'last_qty'];

        this.subscription = new Lightstreamer.Subscription("MERGE", subscriptionKey, subscribedFields);
        this.subscription.setDataAdapter("QUOTER");
        this.subscription.setRequestedSnapshot("no");
        this.subscription.addListener({
            onItemUpdate: (dataObj) => {
                this.onItemUpdated(dataObj);
            }
        })
    }

    //todo: find a way how to test it
    private onItemUpdated(dataObj) {
        let utcDateTime = null;
        let last = null;

        if (dataObj.isValueChanged('last_time')) {
            dataObj.forEachField((name, pos, val) => {

                if (name == 'last_time') {

                    //todo: parse by moment
                    var date_time = new Date(
                        val.substr(0, 4)
                        , val.substr(5, 2) - 1
                        , val.substr(8, 2)
                        , val.substr(11, 2)
                        , val.substr(14, 2)
                        , val.substr(17, 2)
                    );

                    utcDateTime = date_time.getTime() - (date_time.getTimezoneOffset() * 60000);
                }

                if (name == 'last_price') {
                    last = parseFloat(val.replace(',', '.'));
                }

                if (utcDateTime != null && last != null) {
                    let evnt: RtChartOnUpdateEvent = {
                        date: utcDateTime,
                        last: last
                    };
                    this.onItemUpdate.next(evnt);
                }
            })
        }
    }

    public unsubscribe() {
        let isActive = this.subscription.isActive();
        if (isActive) {
            this._lightSvc.connection.unsubscribe(this.subscription);
        }
    }
}

export class RtChartOnUpdateEvent {
    public date: moment.Moment;
    public last: Number;
}
