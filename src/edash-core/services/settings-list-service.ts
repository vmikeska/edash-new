import { Injectable } from '@angular/core';
import { ApiCommService } from './api-comm.service';
import { ValueServiceBase } from './value-service-base';

@Injectable()
export class SettingsListService extends ValueServiceBase<SettingListResponse> {

    constructor(private _apiSvc: ApiCommService) {
        super(_apiSvc);
    }

    protected get url() {
        return "setting/list";
    }
    
}


export class SettingListResponse {
    public pushServer: string;
    public stage: string;
}



