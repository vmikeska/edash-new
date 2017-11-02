import { Injectable } from "@angular/core";
import { ApiCommService } from "./api-comm.service";
import { ValueServiceTextBase } from "./value-service-base";

@Injectable()
export class ApiKeyService extends ValueServiceTextBase {

    constructor(private _apiSvc: ApiCommService) {
        super(_apiSvc);
    }

    protected get url() {
        return "user/api-key";
    }
    
}

