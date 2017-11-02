

import { Injectable } from '@angular/core';
import { LightstreamerService } from './lightstreamer.service';
import { Subject } from 'rxjs/Subject';
import { AlertsDataService, AlertResponse } from './alerts-data.service';
import * as _ from 'lodash';


declare var Lightstreamer;

@Injectable()
export class AlertSubscriptionService {

    constructor(
        private _lsSvc: LightstreamerService,
        private _alertsDataSvc: AlertsDataService
    ) {

        _lsSvc.statusChanged.subscribe(() => {
            if (_lsSvc.isServerOnline) {
                if (!this.firstTimeConnected) {
                    this.firstTimeConnected = true;                    
                    this.createSubscription();
                    this.refreshAsync();
                }
            }
        })
    }

    private firstTimeConnected = false;

    public subscription;

    public onUpperAlert = new Subject<AlertSubscriptionEvent>();

    public async refreshAsync() {
        let alerts = await this._alertsDataSvc.getListAsync();
        this.refresh(alerts);
    }

    public refresh(alerts: AlertResponse[]) {        
        let activeAlerts = _.filter(alerts, {active: true});

        let keys = _.map(activeAlerts, (a) => {
            return this.buildKey(a);
        });
        
        if (keys.length > 0) {
            this.resetKeys(keys);
        }
    }

    private createSubscription() {
        this.subscription = new Lightstreamer.Subscription("MERGE", [], ["upper", "lower", "timestamp"]);
        this.subscription.setDataAdapter("QUOTER");
        this.subscription.setRequestedSnapshot("no");
        this.subscription.addListener({
            onItemUpdate: (dataObj) => {

                if (!dataObj.isSnapshot()) {
                    if (dataObj.isValueChanged('timestamp')) {
                        let itemName = dataObj.getItemName().split(';');
                        let alertId = itemName[1];

                        let upper = (dataObj.getValue('upper') === "true");

                        let evnt: AlertSubscriptionEvent = {
                            alertId: alertId,
                            upper: upper
                        };

                        console.log("----------------------")
                        console.log(evnt)
                        console.log("----------------------")
                        this.onUpperAlert.next(evnt);
                        //showPopupWnd(alertIdTriggered, upper);
                    }
                }
            }
        });
    }

    private resetKeys(keys) {
        this.unsubscribe();

        this.subscription.setItems(keys);        
        this._lsSvc.connection.subscribe(this.subscription);
    }

    private unsubscribe() {
        let isActive = this.subscription.isActive();
        if (isActive) {
            let isSubscribed = this.subscription.isSubscribed();
            if (isSubscribed) {
                this._lsSvc.connection.unsubscribe(this.subscription);
            }
        }
    }

    private buildKey(alert: AlertResponse) {
        return `a;${alert.id}`;
    }


}

export class AlertSubscriptionEvent {
    public alertId;
    public upper;
}