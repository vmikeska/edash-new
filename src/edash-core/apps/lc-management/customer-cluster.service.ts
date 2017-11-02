
import { Injectable } from '@angular/core';
import { ApiCommService } from '../../services/api-comm.service';

@Injectable()
export class CustomerClusterService {

    constructor(private _api: ApiCommService) { }

    public async getAll() {
        let items = await this._api.apiGetAsync<CustomerClusterResponse[]>("consumer/customer-cluster");
        return items;
    }


}

export interface CustomerClusterResponse {
    id: number;
    name: string;
    surcharge: number;
    std: boolean;
}