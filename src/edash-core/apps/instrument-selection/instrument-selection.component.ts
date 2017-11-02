import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnDestroy } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

import * as _ from "lodash";
import { ListBoxComponent } from '../../../desktop/controls/list-box.component';
import { ListButtonComponent } from '../../../desktop/controls/list-button.component';
import { ControlsForm } from '../../../desktop/forms/ControlsForm';
import { TradableInstrumentsService } from '../../services/tradable-instruments.service';
import { ExchangeRes, Vtp, Loadperiod, Instrument } from '../../services/exchange-response';
import { SelectionChangedEvent, ListItem } from '../../../desktop/forms/ListFormControl';


@Component({
    selector: 'instrument-selection',
    templateUrl: 'instrument-selection.html'
})

export class InstrumentSelectionComponent
    implements OnInit, OnDestroy {

    ngOnDestroy() {
        
    }

    constructor(
        public _tradableSvc: TradableInstrumentsService        
    ) {
        this.initForm();
    }

    @ViewChild('instrSelMulti')
    private instrSelMulti: ListButtonComponent;

    @ViewChild('instrSelSingle')
    private instrSelSingle: ListBoxComponent;

    public async ngOnInit() {
        this.exchanges = await this._tradableSvc.getValueAsync();
        this.exchangesObservable.next(this.exchanges);

        this.showExchangesListBox = (this.exchanges.length > 1);
        this.recalControlsCount();

        this.instrumentsObservable.subscribe((instruments) => {
            this.instruments = instruments;
            this.setInstrumentsListChecker();
        })

        this.loadPeriodsObservable.subscribe((loadPeriods) => {
            this.loadPeriods = loadPeriods;
            this.recalControlsCount();
        })
    }

    public showExchangesListBox = false;

    @Input()
    public singleMode = false;

    @Input()
    public mainForm: ControlsForm;

    @Input()
    public singleModeInitialSelection = false;

    @Output()
    public onSelectionChange = new EventEmitter<InstrumentEvent>();

    @Output()
    public onSingeSelectionChange = new EventEmitter<Instrument>();



    public exchangesObservable = new Subject<ExchangeRes[]>();
    public exchanges: ExchangeRes[];

    public vtpsObservable = new Subject<Vtp[]>();

    public loadPeriodsObservable = new Subject<Loadperiod[]>();
    public loadPeriods: Loadperiod[] = [];

    public instrumentsObservable = new Subject<Instrument[]>();
    public instruments: Instrument[];

    private instrumentsKeys = [];

    public colsClass = "col4";

    private recalControlsCount() {
        let num = 2;

        if (this.exchanges.length > 1) {
            num++;
        }

        if (this.loadPeriods.length > 1) {
            num++;
        }

        this.colsClass = `col${num}`;
    }

    public setInstrKeys(keys) {
        this.instrumentsKeys = [].concat(keys);
        this.setInstrumentsListChecker();
    }

    public exchangeChange(e: SelectionChangedEvent) {
        let m = <ExchangeRes>e.changed.origModel;        
        this.vtpsObservable.next(m.vtps);
    }

    public vtpsChange(e: SelectionChangedEvent) {
        let m = <Vtp>e.changed.origModel;
        this.loadPeriodsObservable.next(m.loadPeriods);
    }

    public loadPeriodsChange(e: SelectionChangedEvent) {
        let m = <Loadperiod>e.changed.origModel;
        this.instrumentsObservable.next(m.instruments);
    }


    public instrumentsSelectionChanged(e: SelectionChangedEvent) {
        let i = e.changed.origModel;

        let instrKey = `ia;${i.exchangeId};${i.alias}`;

        let added = e.changed.selected === true;

        this.changeKey(instrKey, added);
    }

    public instrumentSelectionChanged(e: SelectionChangedEvent) {
        this.onSingeSelectionChange.emit(e.changed.origModel);
    }

    private initForm() {
        this.mainForm = new ControlsForm();
    }

    private changeKey(key: string, add: boolean) {
        let oldKeys = [].concat(this.instrumentsKeys);

        if (add) {
            this.instrumentsKeys.push(key);
        } else {
            this.instrumentsKeys = _.reject(this.instrumentsKeys, (i) => { return i === key });
        }

        let ne: InstrumentEvent = {
            added: add,
            key: key,
            instrumentsKeysBefore: oldKeys,
            instrumentsKeysAfter: this.instrumentsKeys
        };

        this.onSelectionChange.emit(ne);
    }

    public receiveKeyChange(key: string, add: boolean) {
        this.changeKey(key, add);

        this.setInstrumentsListChecker();
    }

    private setInstrumentsListChecker() {

        if (!this.instrSelMulti) {
            return;
        }

        this.instrSelMulti.items.forEach((i) => {
            i.selected = false;
        })

        this.instrumentsKeys.forEach((key) => {
            let keyPrms = key.split(";")
            let exchangeId = parseInt(keyPrms[1]);
            let alias = keyPrms[2];

            let instrument = _.find(this.instruments, { alias: alias, exchangeId: exchangeId });
            if (instrument) {
                let listItem = _.find(this.instrSelMulti.items, (i: ListItem) => {
                    return i.origModel.exchangeId === exchangeId && i.origModel.alias === alias;
                });

                listItem.selected = true;                
            }
        })
    }
}


export class InstrumentEvent {
    public added: boolean;
    public key: string;
    public instrumentsKeysBefore: string[];
    public instrumentsKeysAfter: string[];
}