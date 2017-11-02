
import { Injectable } from '@angular/core';

import * as _ from "lodash";
import { Subject } from "rxjs/Subject";
import { ExchangeRes } from './exchange-response';
import { ApiCommService } from './api-comm.service';
import { ValueServiceBase } from './value-service-base';


@Injectable()
export class OtcInstrumentsService extends ValueServiceBase<ExchangeRes[]> {

    private inited = false;

    constructor(private _apiSvc: ApiCommService) {
        super(_apiSvc);
    }

    protected get url() {
        return "customers/otc-instruments";
    }

}





