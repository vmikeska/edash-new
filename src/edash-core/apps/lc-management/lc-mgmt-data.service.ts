
import { Injectable } from '@angular/core';
import { ApiCommService } from '../../services/api-comm.service';
import { RowResult } from './response-analyzer';
import * as _ from 'lodash';

@Injectable()
export class LcMgmtDataService {

    constructor(private _apiSvc: ApiCommService) { 

    }

    public async getListAsync() {    
        let items = await this._apiSvc.apiGetAsync<LoadcurveResponse[]>('consumer/lc/list');
        return items;
    }

    public async getByIdAsync(id: number) {    
        let items = await this._apiSvc.apiGetAsync<LoadcurveResponse[]>('consumer/lc/list');
        let item = _.find(items, {id: id});
        return item;
    }

    public async postAsync(data: LoadcureveRequest) {
        let postData = this.convertRequest(data);
        await this._apiSvc.apiPostAsync("consumer/lc", postData);
    }

    public async deleteAsync(id: number) {
        let url = `consumer/lc/${id}`;
        await this._apiSvc.apiDeleteAsync(url);
    }

    public async updatePartialBase(req: UpdatePartialRequest) {
        let url = `consumer/lc/${req.id}`;

        let req2 = {
            name: req.name,
            clusterId: req.clusterId,
            rollout: req.rollout
        };

        let respPromise = this._apiSvc.apiPutBaseAsync(url, req2, true);
        return respPromise;
    }

    private convertRequest(desiredRequest: LoadcureveRequest) {
        let uglyRequest: LoadcureveRequest2 = {
            clusterId: desiredRequest.clusterId,
            intervalUnit: desiredRequest.intervalUnit,
            isFromValue: desiredRequest.isFromValue,
            name: desiredRequest.name,
            rollout: desiredRequest.rollout,
            vtp: desiredRequest.vtp,
            workUnit: desiredRequest.workUnit,
            values: this.stringifyParams(desiredRequest.values)
        };
        return uglyRequest;
    }

    private stringifyParams(results: RowResult[])
    {
        let strParams = _.map(results, (r) => { return `${r.validity}\t${r.amount}` })
        let strResult = strParams.join("\n");
        return strResult;
    }

}

export interface UpdatePartialRequest {
    id: number;
    name: string;
    clusterId: number;
    rollout: boolean; 
}

export interface Cluster {
    id: number;
    name: string;
    surcharge: number;
    std: boolean;
}

export interface LoadcurveResponse {
    id: number;
    name: string;
    vtp: string;
    amount: number;
    minAmount: number;
    maxAmount: number;
    avgAmount: number;
    utilHoursDuration: number;
    start: string;
    end: string;
    cluster: Cluster;
    hasRating: boolean;
}

export interface LoadcureveRequest {
    name: string;
    vtp: string;
    intervalUnit: string;
    isFromValue: boolean;
    workUnit: string;
    rollout: boolean;
    clusterId: number;
    values: RowResult[];
}

export interface LoadcureveRequest2 {
    name: string;
    vtp: string;
    intervalUnit: string;
    isFromValue: boolean;
    workUnit: string;
    rollout: boolean;
    clusterId: number;
    values: string;
}

// {name: 'start', type: 'date'},
// {name: 'end', type: 'date'}