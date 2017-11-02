
import { Injectable } from '@angular/core';

import * as moment from 'moment';
import * as _ from "lodash";

import 'rxjs/add/operator/toPromise';

import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { ApiCommService } from '../../services/api-comm.service';

@Injectable()
export class PortfolioService_unused {

    constructor(private _apiSvc: ApiCommService) {
        
    }

    public periods = new Subject<PeriodVM[]>();
    periods$ = this.periods.asObservable();


    public async initAsync() {

        let portfolios = await this.getPortfoliosAsync();
        let ps = _.map(portfolios, (p) => { return PortfolioMapping.toVMfromR(p); })
        this.periods.next(ps);

    }

    

    public async getPortfoliosAsync() {
        let res = await this._apiSvc.apiGetAsync<PortfolioResponse[]>("portfolio");
        return res;
    }


}

export class PortfolioMapping {

    public static toVMfromR(r: PortfolioResponse): PeriodVM {

        var vm: PeriodVM = {
            id: r.id,
            key: "",
            maingroup: r.maingroup,
            subgroup: r.subgroup,
            from: this.parseDate(r.start),
            till: this.getPortfolioEndDate(r)
        };

        vm.key = this.getPortfolioKey(vm);

        return vm;
    }

    private static getPortfolioKey(vm: PeriodVM) {
        return `${vm.maingroup} ${vm.subgroup} ${vm.from.format("L")} - ${vm.till.format("L")}`
    }

    private static getPortfolioEndDate(r: PortfolioResponse) {
        let date = this.parseDate(r.end);

        let isPower = r.maingroup === "Power";
        if (isPower) {
            //nothing
        }
        else {
            //todo: check autoassign works
            date.add(-1, "days");
        }

        return date
    }

    private static parseDate(str): moment.Moment {
        return moment(str);
    }
}


export class TestVM {
    public text: string;
    public value: number;
}

export class PeriodVM {
    public key: string;
    public id: number;
    public maingroup;
    public subgroup;
    public from: moment.Moment;
    public till: moment.Moment;
}

export interface PortfolioResponse {
    id: number;
    maingroup: string;
    subgroup: string;
    name: string;
    start: string;
    end: string;
}