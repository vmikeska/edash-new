

import { Injectable } from '@angular/core';
import { ApiCommService } from '../../services/api-comm.service';
import * as _ from 'lodash';

@Injectable()
export class LcFileService {

    constructor(private _api: ApiCommService) { }

    //don't delete yet
    // public async parseExcelAsync(req: LcExcelFileRequest) {

    //     let formData = new FormData();

    //     _.forOwn(req, (value, key) => {
    //         let val = value;
    //         if (typeof value === "number") {
    //             val = value.toString();

    //         }

    //         formData.append(key, value);
    //     });

    //     let response = await this._api.apiPostFormAsync("consumer/lc/upload", formData);
    //     return <LcParsingResponse>response;
    // }

    public async parseTextAsync(text: string) {

        let req = {
            values: text
        };

        let resPromise = this._api.apiPostBaseAsync("consumer/lc", req, true);
        let response = await this.processPromiseResponse(resPromise);
        
        return <LcParsingResponse>response;
    }

    public async parseExcelAsync(req: LcExcelFileRequest) {

        let formData = new FormData();

        _.forOwn(req, (value, key) => {
            let val = value;
            if (typeof value === "number") {
                val = value.toString();
            }

            formData.append(key, value);
        });

        let resPromise = this._api.apiPostForm("consumer/lc/upload", formData);
        let response = await this.processPromiseResponse(resPromise);
       
        return <LcParsingResponse>response;
    }


    private processPromiseResponse(resPromise) {        
        return new Promise(
            (success) => {
                resPromise
                .then((a) => {
                    success(a.json());
                })
                .catch((a: Response) => {
                    success(a.json());
                })
            }
        );


    }

}

export interface LcExcelFileRequest {
    file: File;
    workUnit: string;
    dateColumn: string;
    timeColumn: string;
    valueColumn: string;
    firstDataRow: number;
    excelSheet: number;
}

export interface RecordResult {
    v: string;
    a: number;
    e?: any;
}

export interface LcParsingResponse {
    status: string;
    message: string;
    interval: string;
    rollable: boolean;
    values: RecordResult[];
}