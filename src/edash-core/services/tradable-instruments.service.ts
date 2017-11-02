
import { Injectable } from '@angular/core';

import * as _ from "lodash";
import { Subject } from "rxjs/Subject";
import { ApiCommService } from './api-comm.service';
import { ExchangeRes, Instrument, Vtp, Loadperiod } from './exchange-response';
import { ValueServiceBase } from './value-service-base';


@Injectable()
export class TradableInstrumentsService extends ValueServiceBase<ExchangeRes[]> {

    public segments = [];
    public upload = [];

    constructor(private _apiSvc: ApiCommService) {
        super(_apiSvc);
    }

    protected get url() {
        return "customers/tradable-instruments";
    }
 
    

    public getItemByName(exchangeName: string) {
        let item = _.find(this.response, (i: ExchangeRes) => {
            return i.exchange.name === exchangeName;
        });
        return item;
    }

    public getLoadPeriodByName(instrName: string, vtpName: string, lpName: string) {
        let item = this.getItemByName(instrName);

        let vtp = _.find(item.vtps, (v) => {
            return v.name === vtpName;
        });

        let lp = _.find(vtp.loadPeriods, (v) => {
            return v.name === lpName;
        });

        return lp;
    }

    public getExchangeById(id: number, throwOnNonExisting = true) {
        let ex = _.find(this.response, (e) => { return e.exchange.id == id });

        if (!ex) {
            let errorTxt = `error: ExchangeId ${id} doesn't exist`;
            console.log(errorTxt);
            throw errorTxt;
        }

        return ex;
    }

    public getInstrumentData(exchangeId: number, searchJson) {

        let ex = this.getExchangeById(exchangeId);

        let res: SearchInstrumentResult = null;

        _.forEach(ex.vtps, (vtp) => {

            _.forEach(vtp.loadPeriods, (lp) => {                
                let instrument = _.find(lp.instruments, searchJson);
                if (instrument) {

                    res = {
                        exchange: ex,
                        loadPeriod: lp,
                        vtp: vtp,
                        instrument: instrument
                    }

                    return false;
                }
            });

            if (res) {
                return false;
            }

        });

        return res;
    }

    public getInstrumentDataByAlias(exchangeId: number, alias: string) {
        let r = this.getInstrumentData(exchangeId, { alias: alias });
        return r;
    }

    public getInstrumentDataById(exchangeId: number, id: number) {
        let r = this.getInstrumentData(exchangeId, { id: id });
        return r;
    }

    public getExchInstrData(exchangeId, alias): any {
        
        let instrumentData = this.getInstrumentDataByAlias(exchangeId, alias);

        if (instrumentData) {

            let names = {
                exchange: instrumentData.exchange,
                segment: {
                    name: this.buildSegmentName(instrumentData.vtp.name, instrumentData.loadPeriod.name)
                },
                instr: instrumentData.instrument
            };

            return names;
        }

        return null;
    }


    public buildSegmentName(vtpName: string, lpName: string) {
        if (["GPL", "NCG"].includes(vtpName)) {
            return `Gas-${vtpName}`;
        }

        return `${vtpName}-${lpName}`;
    }


}

export class SearchInstrumentResult {
    public instrument: Instrument;    
    public vtp: Vtp;
    public loadPeriod: Loadperiod;
    public exchange: ExchangeRes;
}

export class GroupParams {
    public displayName: string;
    public id: string;

    public exchangeName: string;
    public vtp: string;
    public loadPeriod: string;
}