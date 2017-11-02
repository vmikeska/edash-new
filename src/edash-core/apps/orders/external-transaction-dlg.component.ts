
import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';

import { Subject } from "rxjs/Subject";

import { DlgContentBase } from '../../../desktop/components/dlg-content-base';
import { ExchangeRes, Loadperiod, Vtp, Instrument } from '../../services/exchange-response';
import { OtcInstrumentsService } from '../../services/otc-instruments.service';
import { OrdersDataService, OtcOrderRequest } from './orders-data.service';
import { SelectionChangedEvent, ListItem } from '../../../desktop/forms/ListFormControl';
import { FormControl } from '../../../desktop/forms/FormControl';
import { DialogButton } from '../../../desktop/components/modal-dialog.component';

@Component({
    selector: 'external-transaction-dlg',
    templateUrl: 'external-transaction-dlg.html'
})

export class ExternalTransactionDlgComponent
    extends DlgContentBase {


    public otcExchangesObservable = new Subject<ExchangeRes[]>();    

    public loadPeriods = new Subject<Loadperiod[]>()
    public vtps = new Subject<Vtp[]>();
    public instruments = new Subject<Instrument[]>();

    protected async onInit() {
        let otcExchanges = await this._otcSvc.getValueAsync();
        this.otcExchangesObservable.next(otcExchanges);        

        this.initMainForm();        
    }

    constructor(private _otcSvc: OtcInstrumentsService, private _ordersDataSvc: OrdersDataService) {
        super();
    }

    private submit() {

        let fv = this.defaultForm.getValuesJson<any>();

        let req: OtcOrderRequest = {
            e: fv.exchange,
            buyside: fv.buy,
            i: fv.instrument,
            price: fv.price,
            quantity: fv.quantity,
            execTimestamp: fv.date.format("YYYY-MM-DD hh:mm")
        }

        this._ordersDataSvc.placeOtcOrderAsync(req);

        this.parentWin.close();
    }


    public onPartnerSelected(e: SelectionChangedEvent) {
        let exchange = <ExchangeRes>e.changed.origModel;
        this.vtps.next(exchange.vtps);
    }

    private initMainForm() {        
        
        let btn: DialogButton = {            
            form: this.defaultForm,
            tabIndex: 9,
            text: "Eintragen",
            visible: true,
            callback: () => {this.submit();}
        };

        this.parentWin.buttonsManager.addCustomButton(btn);
    }

    public fourSelection = true;

    public onVtpsSelected(e: SelectionChangedEvent) {

        let loadPeriods = <Loadperiod[]>e.changed.origModel.loadPeriods;

        this.loadPeriods.next(loadPeriods);

        this.fourSelection = loadPeriods.length > 1;

        let lp = loadPeriods[0];
        this.instruments.next(lp.instruments);
    }

    public onTypeSelected(e: SelectionChangedEvent) {
        let loadPeriod = <Loadperiod>e.changed.origModel;
        this.instruments.next(loadPeriod.instruments);
    }

    public seiteItems: ListItem[] = [
        { text: "Kauf", value: true },
        { text: "Verkauf", value: false },
    ]








}