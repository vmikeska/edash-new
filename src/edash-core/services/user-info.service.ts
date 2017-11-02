import { Injectable } from '@angular/core';
import { ApiCommService } from './api-comm.service';
import { ValueServiceBase } from './value-service-base';

@Injectable()
export class UserInfoService extends ValueServiceBase<UserResponse> {

    constructor(private _apiSvc: ApiCommService) {
        super(_apiSvc);
    }

    protected get url() {
        return "user/get";
    }
    
}






export interface Company {
    created: string;
    id: number;
    name: string;
    city: string;
    street: string;
    zip: string;
}

export interface UserResponse {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    mobile: string;
    lastLogin: string;
    email: string;
    company: Company;
    gender: string;
    expires: string;
    roles: string[];
    customer_id: number;
    wholesaler_id: number;
    reseller_id: number;
}



