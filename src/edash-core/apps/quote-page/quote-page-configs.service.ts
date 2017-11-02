import { Injectable } from '@angular/core';
import { ApiCommService, ResponseType } from '../../services/api-comm.service';
import { TableColumnsState } from './quote-page-config.component';

@Injectable()
export class QuotePageConfigService {

    constructor(
        private _commSvc: ApiCommService
    ) { }

    public async getConfigs() {
        let configs = await this._commSvc.apiGetAsync<QuotePageConfigResponse[]>("user/app/RTDATA/config/list");        
        return configs;
    }

    
    public async deleteConfig(index) {
        let url = `user/app/RTDATA/config/${index}`;
        await this._commSvc.apiDeleteAsync(url, null, false, ResponseType.TXT);
    }

    public async updateConfig(req, index) {
        let url = `user/app/RTDATA/config/${index}`;
        let res = await this._commSvc.apiPostAsync<string>(url, req, false, ResponseType.TXT); 
        return res;
    }

    public async newConfig(req, index) {
        let url = `user/app/RTDATA/config/${index}`;
        let res = await this._commSvc.apiPostAsync<string>(url, req, false, ResponseType.TXT); 
        return res;
    }

    public responseToVM(r: QuotePageConfigResponse): QuotePageConfigVM {

        let vm: QuotePageConfigVM = {
            name: r.name,
            slot: r.slot,
            id: r.id,
            optlock: r.optlock,
            created: r.created,
            config: JSON.parse(r.config)
        }
        return vm;
    }






}


export interface QuotePageConfigResponse {
    name: string;
    slot: number;
    config: string;
    id: number;
    optlock: number;
    created: string;
}


export interface QuotePageUpdateConfigRequest {
    name: string;
    value: string;
}

//objects

export interface QuotePageConfigVM {
    name: string;
    slot: number;
    config: ConfigVM;
    id: number;
    optlock: number;
    created: string;
}

export interface ConfigVM {
    columns: TableColumnsState[];
    instruments: string[];
    position: Position;
    size: Size;
}



export interface Filters {
    filterscount: number;
}



export interface Column {
    width: number;
    hidden: boolean;
    pinned: boolean;
    groupable: boolean;
    resizable: boolean;
    draggable: boolean;
    text: string;
    align: string;
    cellsalign: string;
    index: number;
}

export interface Columns {
    instrKey: Column;
    maxAmount: Column;
    minAmount: Column;
    symbol: Column;
    exchName: Column;
    segmentKey: Column;
    bid_qty: Column;
    bid_price: Column;
    ask_price: Column;
    ask_qty: Column;
    last_price: Column;
    last_qty: Column;
    last_time: Column;
    open: Column;
    high: Column;
    low: Column;
    cumqty: Column;
    trades: Column;
}

export interface GridState {
    width: number;
    height: number;
    pagenum: number;
    pagesize: number;
    pagesizeoptions: number[];
    selectedrowindexes: any[];
    selectedrowindex: number;
    filters: Filters;
    groups: any[];
    columns: Columns;
}

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

