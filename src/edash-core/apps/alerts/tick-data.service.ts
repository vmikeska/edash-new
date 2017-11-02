
import { Injectable } from '@angular/core';
import { ApiCommService } from '../../services/api-comm.service';
import * as _ from 'lodash';
import { Utils } from '../../../common/Utils';

@Injectable()
export class TickDataService {

    constructor(private _apiCommSvc: ApiCommService) { }

    public async getTickDataAsync(exchangeId, instrumentId){

        let req = {
            e: exchangeId,
            i: instrumentId
        };

        let res = await this._apiCommSvc.apiGetAsync<TickResponse[]>("history/tick", req);
        return res;
    }

    public async getTickDataMappedAsync(exchangeId, instrumentId) {
        let res = await this.getTickDataAsync(exchangeId, instrumentId);

        let items = this.map(res);
        return items;        
    }

    public map(items: TickResponse[]) {
        return _.map(items, (i) => {
            let o: TickVM = {
                created: i.createdUtc,
                price: parseFloat(i.executionPrice),
                quantity: parseFloat(i.executionQuantity)
            };

            return o;
        })
    }
        
}

export class TickVM {
    created: number;
    price: number;
    quantity: number;
}

export class TickResponse {
    createdUtc: number;
    executionPrice: string;
    executionQuantity: string;
}