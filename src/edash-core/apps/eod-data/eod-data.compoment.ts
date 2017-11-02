

import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Subject } from 'rxjs/Subject';
import { WinContentBase } from '../../../desktop/components/win-content-base';
import { TradableInstrumentsService } from '../../services/tradable-instruments.service';
import { ApiCommService } from '../../services/api-comm.service';
import { TabItem } from '../../../desktop/controls/tabs.component';
import { DataTableHeaderItem, DataColumnType } from '../../../desktop/controls/data-table.component';
import { ControlsForm, ControlValueChangedEvent } from '../../../desktop/forms/ControlsForm';
import { Instrument } from '../../services/exchange-response';

@Component({
    selector: 'eod-data',
    templateUrl: 'eod-data.html'
})

export class EodDataComponent
    extends WinContentBase {

    constructor(private _apiComm: ApiCommService, private _tradableSvc: TradableInstrumentsService) {
        super();
    }

    protected async onInit() {
        this.initForm();
    }

    public get dateFrom() {
        let control = this.formsManager.defaultForm.getControlByName("dateFrom");
        return control.formValue;
    }

    public set dateFrom(value: moment.Moment) {
        let control = this.formsManager.defaultForm.getControlByName("dateFrom");
        control.setValue(value);
    }

    public get dateTo() {
        let control = this.formsManager.defaultForm.getControlByName("dateTo");
        return control.formValue;
    }

    public set dateTo(value: moment.Moment) {
        let control = this.formsManager.defaultForm.getControlByName("dateTo");
        control.setValue(value);
    }

    public tabs: TabItem[] = [
        { id: "tiInstruments", name: "Instruments" },
        { id: "tiUnits", name: "Einheiten" },

    ];

    private setTitle() {
        let si = this.selectedInstrument;
        let idata = this._tradableSvc.getInstrumentDataById(si.exchangeId, si.id);

        this.parentWin.title = `Handelspartner: ${idata.exchange.exchange.name} - Segment: ${idata.vtp.name} - Symbol: ${idata.instrument.instrument.symbol}`;
    }

    public headers: DataTableHeaderItem[] = [
        { col: "tradingDate", name: "Trade date", type: DataColumnType.TypeDateMoment, typeArgs: "l", visible: true },
        { col: "open", name: "Open", type: DataColumnType.TypeFloat, typeArgs: ".2", visible: true },
        { col: "high", name: "High", type: DataColumnType.TypeFloat, typeArgs: ".2", visible: true },
        { col: "low", name: "Low", type: DataColumnType.TypeFloat, typeArgs: ".2", visible: true },
        { col: "close", name: "Close", type: DataColumnType.TypeFloat, typeArgs: ".2", visible: true },

        { col: "mav38", name: "MAV 38", type: DataColumnType.TypeFloat, typeArgs: ".2", visible: false },
        { col: "mav200", name: "MAV 200", type: DataColumnType.TypeFloat, typeArgs: ".2", visible: false },
        { col: "cumulatedQuantity", name: "CumQty", type: DataColumnType.TypeInt, visible: false },
        { col: "tradesCount", name: "Trades", type: DataColumnType.TypeInt, visible: false },
    ];
    
    public selectedInstrument: Instrument;

    public observableData = new Subject<EodVM[]>();

    public async onInstrumentSelected(i: Instrument) {
        this.selectedInstrument = i;        
    }


    public exporBtnClick() {

        let i = this.selectedInstrument;

        if (!i) {
            return;
        }

        let idata = this._tradableSvc.getInstrumentDataById(i.exchangeId, i.id);

        let url = `history/eod/_${idata.instrument.instrument.symbol}_${idata.exchange.exchange.name}.csv?i=${i.id}&e=${i.exchangeId}&from=${this.dateFrom.format("YYYY-MM-DD")}&till=${this.dateTo.format("YYYY-MM-DD")}`;

        window.location.href = this._apiComm.getApiUrl(url);
    }

    private async refreshDataAsync() {
        if (!this.selectedInstrument) {
            return;
        }

        let i = this.selectedInstrument;
        let data = await this.getDataAsync(i.exchangeId, i.id, this.dateFrom, this.dateTo);

        let viewData = this.parseResponses(data);
        this.observableData.next(viewData);

        this.setTitle();
        console.log("refreshing data");
    }

    private initForm() {
        let form = this.formsManager.defaultForm;
        
        form.onValueChanged.subscribe(async (e: ControlValueChangedEvent) => {
            if (e.control.name === "dateFrom") {
                if (this.dateTo.isBefore(this.dateFrom)) {
                    this.dateTo = this.dateFrom.clone();                    
                }                
            }

            this.refreshDataAsync();
        });

        form.onAllControlsAdded.subscribe(() => {
            // todo: set minimal date to [2014, 8, 1], not yet implemented in calendar
            this.dateFrom = moment([2014, 8, 1]);
            this.dateTo = moment();
        })

        
    }

    private async getDataAsync(exchangeId: number, instrumentId: number, fromDate: moment.Moment, toDate: moment.Moment) {

        let data = {
            e: exchangeId,
            i: instrumentId,
            from: fromDate.format("YYYY-MM-DD"),
            till: toDate.format("YYYY-MM-DD")
        };

        let res = await this._apiComm.apiGetAsync<EodResponse[]>("history/eod", data);
        return res;
    }

    private parseResponses(response: EodResponse[]) {
        let rs = _.map(response, (r) => {
            return this.parseResponse(r);
        })

        return rs;
    }

    private parseResponse(res: EodResponse) {

        let date = moment(res.tradingDate, "YYYY-MM-DD");

        let r: EodVM = {
            open: parseFloat(res.open),
            high: parseFloat(res.high),
            low: parseFloat(res.low),
            close: parseFloat(res.close),
            mav38: parseFloat(res.mav38),
            mav200: parseFloat(res.mav200),

            tradesCount: parseInt(res.tradesCount),
            tradingUtc: res.tradingUtc,
            tradingDate: date,
            cumulatedQuantity: parseFloat(res.cumulatedQuantity)
        };

        return r;
    }

}

export interface EodResponse {
    open: string;
    high: string;
    low: string;
    close: string;
    mav38: string;
    mav200: string;

    cumulatedQuantity: string;
    tradesCount: string;
    tradingUtc: number;
    tradingDate: string;
}

export interface EodVM {
    open: number;
    high: number;
    low: number;
    close: number;
    mav38: number;
    mav200: number;

    tradesCount: number;
    tradingUtc: number;

    tradingDate: moment.Moment;

    cumulatedQuantity: number;
}