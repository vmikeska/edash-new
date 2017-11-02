
import { Injectable } from "@angular/core";

import * as moment from 'moment';
import { ApiCommService, ResponseType } from "../../services/api-comm.service";


@Injectable()
export class OrdersDataService {

    constructor(private _apiSvc: ApiCommService) {

    }

    public async deleteOrderAsync(orderId: number) {
        let url = `order/delete/${orderId}`;
        await this._apiSvc.apiDeleteAsync(url, null, false, ResponseType.TXT);
    }

    public async deleteOtcOrderAsync(orderId: number) {
        let url = `otc-order/${orderId}`;
        await this._apiSvc.apiDeleteAsync(url, null, false, ResponseType.TXT);
    }

    public async updateOrderAsync(orderId, data: OrderUpdateRequest) {
        let url = `order/update/${orderId}`;
        await this._apiSvc.apiPostAsync(url, data, false, ResponseType.TXT);        
    }

    public async acceptOrderAsync(orderId: number, state: string) {
        if (state === "counteroffer") {
            let url = `consumer/lc/orders/${orderId}/counteroffer-accept`;
            await this._apiSvc.apiPutAsync(url);
        }
    }

    public async getData(active: boolean) {
        let url = `order/list?active=${active.toString()}`;
        let results = await this._apiSvc.apiGetAsync<OrderResponse[]>(url);
        return results;
    }

    public async placeOtcOrderAsync(data: OtcOrderRequest) {
        let url = "otc-order";
        await this._apiSvc.apiPostAsync(url, data, false, ResponseType.TXT);        
    }


}

export class OrderUpdateRequest {
    quantity: number;
    limit: number;
    expires: string;

}

export interface OtcOrderRequest {
    e: number;
    i: number;
    buyside: boolean;
    quantity: number;
    price: number;
    execTimestamp: string;
}

export interface Execution {
    created: string;
    price: number;
    quantity: number;
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
    deliveryHours: string;
    groups: Groups;
}

export interface Groups {
    maingroup;
    subgroup;
}

export interface Company {
    created: string;
    id: number;
    name: string;
    city: string;
    street: string;
    zip: string;
}

export interface Customer {
    id: number;
    company: Company;
}

export interface OrderResponse {
    id: number;
    created: string;
    buySide: boolean;
    orderQuantity: number;
    orderLimit: number;
    orderValue: number;
    orderState: string;
    orderType: string;
    expires: string;
    executions: Execution[];
    exchange: Exchange;
    instrument: Instrument;
    customer: Customer;
    otc: boolean;

    //not from response
    isin;
    wkn;

}
