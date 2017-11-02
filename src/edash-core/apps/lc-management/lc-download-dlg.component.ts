
import { Component } from '@angular/core';
import { DlgContentBase } from '../../../desktop/components/dlg-content-base';
import { ListItem } from '../../../desktop/forms/ListFormControl';

import * as moment from "moment";
import { FormControl } from '../../../desktop/forms/FormControl';
import { ApiCommService } from '../../services/api-comm.service';
import * as _ from 'lodash';
import { Utils } from '../../../common/Utils';
import { DialogButton } from '../../../desktop/components/modal-dialog.component';

@Component({
    selector: 'lc-download-dlg',
    templateUrl: 'lc-download-dlg.html'
})

export class LcDownloadDlgComponent extends DlgContentBase {
    constructor(private _api: ApiCommService) { 
        super();
    }

    protected onInit() {
        
        this.createButtons();

        this.defaultForm.onButtonClicked.subscribe((btn: FormControl) => {                        
            let link = this.buildLink();
            
            Utils.downloadFile(link);

            setTimeout(() => {
                this.parentWin.close();
            }, 1000);
        })
    }

    public lName: string;

    public sinceDefault = moment();
    public untilDefault = moment().add(5, "years").startOf("year");

    public downloadedId: number;

    public unitsList: ListItem[] = [
        {text: 'Menge in MWh', value: 'MWh'},
        {text: 'Menge in kWh', value: 'kWh'},
        {text: 'Leistung in MW', value: 'MW'},
        {text: 'Leistung in kW', value: 'kW'}
    ]

    public periods: ListItem[] = [
        {text: "Monat", value: "MONTHS"},
        {text: "Tag", value: "DAYS"},
        {text: "Stunde", value: "HOURS"},
        {text: "15 min", value: "QUARTERHOURS"},        
    ]

    private createButtons() {
        this.parentWin.buttonsManager.addCloseButton();
        
        let downloadBtn: DialogButton = {            
            form: this.defaultForm,
            tabIndex: 4,
            text: "Download",
            visible: true
        };

        this.parentWin.buttonsManager.addCustomButton(downloadBtn);
    }

    private buildLink() {
        let vals = this.defaultForm.getValuesJson<LcDownloadForm>();

        let sinceStr = vals.since.format("YYYY-MM-DD");
        let untilStr = vals.until.format("YYYY-MM-DD");
        let period = _.first(vals.period).value;
        let units =  _.first(vals.units).value;

        let url = this._api.getApiUrl(`consumer/lc/${this.downloadedId}/values.csv?from=${sinceStr}&till=${untilStr}&intervalUnit=${period}&workUnit=${units}`);
        return url;        
    }

        
}

export class LcDownloadForm {
    since: moment.Moment;
    until: moment.Moment; 
    period: ListItem[]; 
    units: ListItem[];
}