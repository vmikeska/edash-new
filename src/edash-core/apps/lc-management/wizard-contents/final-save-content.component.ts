
import { Component, Input } from '@angular/core';
import { WizardConentBase } from './wizard-content-base';
import { AnalyseResult, ResponseAnalyzer } from '../response-analyzer';
import { LcParsingResponse } from '../lc-file.service';
import { ListItem } from '../../../../desktop/forms/ListFormControl';
import { TradableInstrumentsService } from '../../../services/tradable-instruments.service';
import * as _ from 'lodash';
import { Subject } from 'rxjs/Subject';
import { CustomerClusterService, CustomerClusterResponse } from '../customer-cluster.service';
import { ControlsForm } from '../../../../desktop/forms/ControlsForm';
import { AnalyseReportData } from '../lc-types';
import { ControlsValidator } from '../../../../desktop/forms/control-validator';

@Component({
    selector: 'final-save-content',
    templateUrl: 'final-save-content.html'
})

export class FinalSaveContentComponent extends WizardConentBase<SaveResult> {
    constructor(
        private _tradableSvc: TradableInstrumentsService,
        private _customerClusterSvc: CustomerClusterService
    ) { 
        super();
    }

    public unitsList: ListItem[] = [
        {text: 'Menge in MWh', value: 'MWh'},
        {text: 'Menge in kWh', value: 'kWh'},
        {text: 'Leistung in MW', value: 'MW'},
        {text: 'Leistung in kW', value: 'kW'}
    ]

    public useFromList: ListItem[] = [
        {text: '"Von"-Werte', value: true},
        {text: '"Bis"-Werte', value: false}
    ];

    public vtpsObservable = new Subject<ListItem[]>();
    public clusterObservable = new Subject<CustomerClusterResponse[]>();

    protected async onInit() {        
        this.buildNameValidator();
        await this.loadVtpsAsync();        
        await this.loadCustomerCluster();
    }

    @Input()
    public analyseData: AnalyseReportData;

    private async loadVtpsAsync() {
        let exchanges = await this._tradableSvc.getValueAsync();
        
        let vtps = [];
        exchanges.forEach((exchange) => {
            vtps = vtps.concat(exchange.vtpsLc);
        });
        let uniqueVtps = _.uniq(vtps);

        let res = _.map(uniqueVtps, (i) => {
            let item: ListItem = {
                text: i,
                value: i
            };
            return item;
        });

        this.vtpsObservable.next(res);
    }

    private async loadCustomerCluster() {
        let items = await this._customerClusterSvc.getAll();
        this.clusterObservable.next(items);
    }

    public nameValidator = new ControlsValidator();
    
    private buildNameValidator() {
        this.nameValidator.isNotEmpty = true;
    }

}

export interface SaveResult {
    clusterId: number;
    description: string;
    roll: boolean;
    units: string;
    time: boolean;
    vtp: string;
}