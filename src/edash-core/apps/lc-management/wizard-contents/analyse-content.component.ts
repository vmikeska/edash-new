
import { Component, OnInit, Input } from '@angular/core';
import { WizardConentBase } from './wizard-content-base';
import { AnalyseReportData } from '../lc-types';
import { AnalyseResult, RowResult } from '../response-analyzer';
import { LcParsingResponse } from '../lc-file.service';
import { DataTableHeaderItem, DataColumnType } from '../../../../desktop/controls/data-table.component';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';

@Component({
    selector: 'analyse-content',
    templateUrl: 'analyse-content.html'
})

export class AnalyseContentComponent extends WizardConentBase<any> {
    constructor() { 
        super();        
    }

    public headers: DataTableHeaderItem[] = [
        { name: "Datum/Zeit", col: "validity", visible: true, }, //,type: DataColumnType. 'dd.MM.yyyy HH:mm'
        { name: "Wert", col: "amount", visible: true, type: DataColumnType.TypeFloat, typeArgs: ".3" },
        { name: "Problem", col: "error", visible: true },
    ];

    public data: RowResult[];

    protected onInit() {
        let dataWithError = _.filter(this.analyseResult.allData, (i) => { return i.error !== ""; });
        this.data = dataWithError;
    }

    @Input()
    public analyseResult: AnalyseResult;

    @Input()
    public analyseData: AnalyseReportData;

}