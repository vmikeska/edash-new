
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import * as _ from "lodash";
import { Subject } from "rxjs/Subject";

import { TradableInstrumentsService } from '../../services/tradable-instruments.service';
import { ListButtonComponent, ButtonItem, BtnEvent } from '../../../desktop/controls/list-button.component';
import { QuotePageComponent } from './quote-page.component';
import { QuotePageConfigService, QuotePageConfigVM, ConfigVM, QuotePageUpdateConfigRequest } from './quote-page-configs.service';
import { NewConfigDialogComponent } from './new-config-dialog.component';
import { ListItem } from '../../../desktop/forms/ListFormControl';
import { MdlgCreationService } from '../../../desktop/services/mdlg-creation.service';


@Component({
    selector: 'quote-page-config',
    templateUrl: 'quote-page-config.html'
})

export class QuotePageConfigComponent
    implements OnInit {
    ngOnInit(): void {
        this.loadConfigs();

        this.savedConfigsObservable.subscribe((configs) => {
            this.savedConfigs = configs;
        })
    }

    constructor(
        private _configSvc: QuotePageConfigService,
        private _mdlgSvc: MdlgCreationService,
        private _tradableSvc: TradableInstrumentsService,

    ) { }

    @ViewChild("configListBox")
    private configListBox: ListButtonComponent;

    @Input()
    public qp: QuotePageComponent;

    public savedConfigsObservable = new Subject<QuotePageConfigVM[]>();
    public savedConfigs: QuotePageConfigVM[];

    public configButtons: ButtonItem[] = [
        { ico: "icon-download", action: "save", caption: "save" },
        { ico: "icon-trash", action: "delete", caption: "delete" }
    ];

    private async loadConfigs() {        
        let confs = await this._configSvc.getConfigs();
        let confsVM = _.map(confs, (c) => { return this._configSvc.responseToVM(c); });        
        this.savedConfigsObservable.next(confsVM);
    }

    private getAvailableSlotId() {
        for (let act = 1; act <= 10; act++) {
            let config = _.find(this.savedConfigs, { slot: act });

            if (!config) {
                return act;
            }
        }

        //todo: hot to solve these slots
        throw "AllSlotsAreTaken";
    }

    public newConfigClick() {
        this.openNewConfigDlg();
    }

    public async onNameSave(e: ListItem) {
        let om = e.origModel;
        let conf = <ConfigVM>e.origModel.config;

        let req = this.buildConfigRequest(e.text, conf);

        let res = await this._configSvc.updateConfig(req, om.slot);

        this.loadConfigs();
    }

    private openNewConfigDlg() {
        let instances = this._mdlgSvc.createInstance<NewConfigDialogComponent>(NewConfigDialogComponent);

        instances.dlgInstance.title = "New config creation";

        instances.dlgInstance.buttonsManager.addCloseButton();

        instances.dlgInstance.buttonsManager.addEasyButton("Create", () => this.createSlotClicked(instances));
    }

    private async createSlotClicked(instances) {
        let index = this.getAvailableSlotId();
        let res = await this.saveConfSlot(index, instances.contentInstance.name);

        await this.loadConfigs();

        instances.dlgInstance.close();
    }

    public configBtnClicked(e: BtnEvent) {

        if (e.action === "link") {
            this.loadConfSlot(e.item.origModel);
        }

        if (e.action === "save") {
            this.saveConfSlot(e.item.origModel.slot, e.item.text);
        }

        if (e.action === "delete") {

            let insts = this._mdlgSvc.showConfirmDialog("Configuration delete", "Would you like to delete this configuration?", "Delete", () => {
                this.deleteConfSlot(e.item.origModel.slot);
                insts.dlgInstance.close();
            });

        }

    }

    private async loadConfSlot(slot) {
        this.clearQuotePage();

        let config = slot.config;

        await this.setWindowsPosAndSize(config);

        this.setColumnsVisibility(config.columns);

        let instKeys = this.extractInstrKeysFromConfig(config.instruments);
        this.loadByInstrKeys(instKeys);
    }

    private async setWindowsPosAndSize(config) {
        return new Promise((success) => {

            this.qp.parentWin.left = config.position.x;
            this.qp.parentWin.top = config.position.y;

            this.qp.parentWin.width = config.size.width;
            this.qp.parentWin.height = config.size.height;

            setTimeout(() => {
                this.qp.parentWin.resizeElements();
                success();
            }, 100);

        })
    }

    private extractInstrKeysFromConfig(instruments) {
        let instKeys = [];

        instruments.forEach((instrument) => {
            let instrData = instrument.split(';');
            let exchangeId = parseInt(instrData[1]);
            let alias = instrData[2];

            let ex = this._tradableSvc.getExchangeById(exchangeId);
            if (!ex) {
                this._mdlgSvc.showInfoDialog("Cannot load configuration", "The configuration cannot be loaded, possibly old data, delete the configuration, or contact your administrator.")
                throw "PossiblyOldConfiguration";
            }

            let checkInstr = this._tradableSvc.getExchInstrData(exchangeId, alias);

            //todo: if (checkInstr.instr.alias) ?
            if (typeof checkInstr.instr.alias != 'undefined') {
                instKeys.push(instrument);
            }
        });

        return instKeys;
    }

    private setColumnsVisibility(columns) {
        if (columns) {
            columns.forEach((c) => {

                let header = _.find(this.qp.headers, { col: c.col });
                if (header) {
                    header.visible = c.visible;
                }
            })
        }
    }

    private loadByInstrKeys(instKeys) {
        this.qp.syncedSorting.start(instKeys);

        this.qp.subSvcInstance.subscribe(instKeys);

        this.qp.instrumentsSelector.setInstrKeys(instKeys);
    }

    private clearQuotePage() {
        this.qp.subSvcInstance.unsubscribe(true);

        this.qp.buildedInstruments = [];

        this.qp.rebindTable();
    }

    private async deleteConfSlot(index) {

        await this._configSvc.deleteConfig(index);

        this.loadConfigs();
    }

    private async saveConfSlot(index: number, name: string) {
        let conf = this.getCurrentConfig(index);

        let req = this.buildConfigRequest(name, conf);

        let res = await this._configSvc.updateConfig(req, index);

        this.loadConfigs();

        return res;
    }

    private buildConfigRequest(name: string, conf: ConfigVM) {
        let req: QuotePageUpdateConfigRequest = {
            name: name,
            value: JSON.stringify(conf)
        };

        return req;
    }

    private getCurrentInstruments() {
        return this.qp.subSvcInstance.instrumentKeys;
    }

    private getColumnsState() {
        let headers = this.qp.table.headers;

        let cols = _.map(headers, (h) => {
            let c: TableColumnsState = {
                col: h.col,
                visible: h.visible
            };

            return c;
        });

        return cols;
    }

    private getCurrentConfig(index) {

        let config: ConfigVM = {
            columns: this.getColumnsState(),
            instruments: this.getCurrentInstruments(),
            position: {
                x: this.qp.parentWin.left,
                y: this.qp.parentWin.top
            },
            size: {
                width: this.qp.parentWin.width,
                height: this.qp.parentWin.height
            }
        };


        return config;
    }
}

export class TableColumnsState {
    public col: string;
    public visible: boolean;
}
