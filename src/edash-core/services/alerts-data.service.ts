
import { Injectable } from '@angular/core';
import { ApiCommService } from './api-comm.service';
import * as _ from 'lodash';


@Injectable()
export class AlertsDataService {

    constructor(private _apiSvc: ApiCommService) {

    }


    public async getListAsync() {
        let res = await this._apiSvc.apiGetAsync<AlertResponse[]>("alert/list");        
        return res;
    }

    public async getByIdAsync(id: number) {
        //when redesigned, request get by id
        let res = await this._apiSvc.apiGetAsync<AlertResponse[]>("alert/list");        
        let item = _.find(res, {id: id});

        return item;
    }



    public async deleteAsync(id: number) {
        let url = `alert/delete/${id}`;
        await this._apiSvc.apiDeleteAsync(url);
    }

    public async createAsync(req: AlertCreateRequest){
        await this._apiSvc.apiPutAsync("alert/create", req);
    }

    public async updateAsync(id: number, req: AlertUpdateRequest) {
        let url = `alert/update/${id}`;
        await this._apiSvc.apiPostAsync(url, req)
    }

}

export interface AlertUpdateRequest {        
    upper: number;
    lower: number;
    sms: boolean;
    email: boolean;
    client: boolean;
    remarks: string;
    callback: boolean;    
}

export interface AlertCreateRequest {
    e: number;
    i: number;
    upper: number;
    lower: number;
    sms: boolean;
    email: boolean;
    client: boolean;
    remarks: string;
    callback: boolean;    
}

export interface Exchange {
    id: number;
    name: string;
    opening: string;
    closing: string;
}

export interface Instrument {
    id: number;
    market: string;
    type: string;
    category: string;
    symbol: string;
    eexSymbol?: any;
    name: string;
    vtp: string;
    loadPeriod: string;
    deliveryStart: string;
    deliveryEnd: string;
    deliveryHours: number;
}

export interface AlertResponse {
    id: number;
    created: string;
    active: boolean;
    remarks: string;
    upperPrice: string;
    upperPassed: string;
    lowerPrice: string;
    lowerPassed: string;
    actEmail: boolean;
    actClient: boolean;
    actSms: boolean;
    exchange: Exchange;
    instrument: Instrument;
}