import { Subject } from "rxjs/Subject";
import { ApiCommService } from "./api-comm.service";

export class ValueServiceBase<T> {

    protected apiSvc: ApiCommService;

    constructor(apiSvc: ApiCommService) {
        this.apiSvc = apiSvc;
        this.refresh();
    }

    public onResponse = new Subject<T>();
    public response: T;

    protected get url(): string {
        throw "EndpointUrlNotSpecified";
    }

    public async refresh() {
        this.response = await this.getAsync();
        this.onResponse.next(this.response);
    }

    public async getAsync() {
        let res = await this.apiSvc.apiGetAsync<T>(this.url);
        return res;
    }

    public async getValueAsync() {
        return new Promise<T>(async (success) => {
            
            if (this.response) {
                success(this.response);
            } else {
                await this.refresh();
                success(this.response);
            }
        })
    }

}

export class ValueServiceTextBase extends ValueServiceBase<string>  {
    public async getAsync() {

        let res = await this.apiSvc.apiGetBaseAsync(this.url);
        let txt = res.text();   
        
        return txt;
    }
}