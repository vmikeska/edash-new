
import { Component } from '@angular/core';
import { WizardConentBase } from './wizard-content-base';
import { LcFileService, LcExcelFileRequest, LcParsingResponse } from '../lc-file.service';
import { ApiCommService } from '../../../services/api-comm.service';

@Component({
    selector: 'standard-file-upload-content',
    templateUrl: 'standard-file-upload-content.html'
})

export class StandardFileUploadContentComponent extends WizardConentBase<LcParsingResponse> {
    constructor(private _fileSvc: LcFileService, private _api: ApiCommService) { 
        super();
    }

    public async onFileSelected(file: File) {
        
        let req: LcExcelFileRequest = {
            dateColumn: "D",
            excelSheet: 1,
            file: file,
            firstDataRow: 9,
            timeColumn: "D",
            valueColumn: "E",
            workUnit: "MW"
        };
        
        let res = await this._fileSvc.parseExcelAsync(req);
        this.onFinished.next(res);        
    }

    public downloadClick() {
        let url = "documents/-1";
        window.location.href = this._api.getApiUrl(url);
    }

    
    
}