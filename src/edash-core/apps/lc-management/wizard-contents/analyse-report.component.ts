
import { Component, Input } from '@angular/core';
import { AnalyseReportData } from '../lc-types';

@Component({
    selector: 'analyse-report',
    templateUrl: 'analyse-report.html'
})

export class AnalyseReportComponent {
    constructor() { }

    @Input()
    public data: AnalyseReportData;
}


