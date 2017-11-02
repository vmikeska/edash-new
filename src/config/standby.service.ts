
import { Injectable } from '@angular/core';
import { AlertSubscriptionService } from '../edash-core/services/alert-subscription.service';
import { AlertPopupComponent } from '../edash-core/apps/alerts/alert-popup.component';
import { MdlgCreationService } from '../desktop/services/mdlg-creation.service';


@Injectable()
export class StandbyService {
    
    constructor(
        private _alertsSubscriptionSvc: AlertSubscriptionService,
        private _mdlgSvc: MdlgCreationService
    ) {
        this.subscribeAlerts();
    }

    private subscribeAlerts() {
        this._alertsSubscriptionSvc.onUpperAlert.subscribe((e) => {
            
            let insts = this._mdlgSvc.createInst<AlertPopupComponent>(AlertPopupComponent, 
                (content) => {}, 
                (dialog) => {}
            );

            insts.contentInstance.initAsync(e.alertId, e.upper);   
        })
    }
}