import { Injectable } from "@angular/core";
import { ValueServiceBase } from "./value-service-base";
import { ApiCommService } from "./api-comm.service";


@Injectable()
export class MenuListService extends ValueServiceBase<MenuResponse> {

    constructor(private _apiSvc: ApiCommService) {
        super(_apiSvc);
    }

    protected get url() {
        return "user/menu/list";
    }
}

export class Item {
    name: string;
    permission: string;
}

export class MenuItem {
    name: string;
    items: Item[];
}

export class MenuResponse {
    name: string;
    items: MenuItem[];
}

