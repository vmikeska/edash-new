import { Component, ViewChild, EventEmitter } from '@angular/core';
import { DlgContentBase } from '../../../desktop/components/dlg-content-base';
import { WizardStep, WizardComponent } from '../../../desktop/controls/wizard.component';
import { Instrument } from '../../services/exchange-response';
import { DialogButton } from '../../../desktop/components/modal-dialog.component';
import * as _ from 'lodash';
import { StockChartComponent } from '../../highcharts/stock-chart.component';
import { TickDataService, TickVM } from './tick-data.service';
import { ControlsForm } from '../../../desktop/forms/ControlsForm';
import { ValueSliderUtils, ValueSliderResult, ValueSliderComponent } from '../../../desktop/controls/value-slider.component';
import { InputNumberComponent } from '../../../desktop/controls/input-number.component';
import { TradableInstrumentsService } from '../../services/tradable-instruments.service';
import { AlertsDataService, AlertCreateRequest, AlertResponse, AlertUpdateRequest } from '../../services/alerts-data.service';
import { Utils } from '../../../common/Utils';
import { MdlgCreationService } from '../../../desktop/services/mdlg-creation.service';

@Component({
    selector: 'alert-detail-dialog',
    templateUrl: 'alert-detail-dialog.html'
})

export class AlertDetailDialogComponent
    extends DlgContentBase {

    constructor(
        private _ticksSvc: TickDataService,
        private _tradableSvc: TradableInstrumentsService,
        private _alertsDataSvc: AlertsDataService,
        private _mdlgSvc: MdlgCreationService
    ) {
        super();
    }

    protected async onInit() {
        this.settingsForm = this.formsManager.createForm();

        this.setSteps();

        if (this.isEditing) {
            this.loadChartEdit();
        } else {
            this.initCreateButtons();
        }
    }

    public get isEditing() {
        let editing = !Utils.isNullOrUndefined(this.editedId);
        return editing;
    }

    @ViewChild('wizard')
    private wizard: WizardComponent;

    public editedId?: number;
    public editedObj: AlertResponse;

    private ticksData;
    public limitValues: LimitValues;

    private origTitle: string;

    private selectedInsturment: Instrument;

    public settingsForm: ControlsForm;

    @ViewChild("chartComponent")
    public chartComponent: StockChartComponent;

    @ViewChild('upperInputNumber')
    private upperInputNumber: InputNumberComponent;

    @ViewChild('lowerInputNumber')
    private lowerInputNumber: InputNumberComponent;

    @ViewChild('lowerSlider')
    private lowerSlider: ValueSliderComponent;

    @ViewChild('upperSlider')
    private upperSlider: ValueSliderComponent;

    public upperLimit: number;
    public lowerLimit: number;

    public notifyPopupDefaultValue: boolean;
    public notifyMailDefaultValue: boolean
    public notifySMSDefaultValue: boolean
    public remarkDefaultValue: string;

    public onListChange = new EventEmitter();

    private get firstYaxis() {
        if (!this.chartComponent || !this.chartComponent.instance) {
            return null;
        }

        let yAxis = this.chartComponent.instance.yAxis[0];
        return yAxis;
    }


    private get lastTick() {
        let t = _.last(this.ticksData);
        return t;
    }

    private get lastTickPrice() {
        return this.lastTick[1];
    }

    private get isInstrumentSelected() {
        return !Utils.isNullOrUndefined(this.selectedInsturment);
    }

    private oneStep = 0.01;

    public steps: WizardStep[];

    public async onInstrumentSelected(instrument: Instrument) {
        this.selectedInsturment = instrument;
        this.loadChartCreate(instrument);
    }

    private setSteps() {
        this.steps = [
            { no: 1, name: "Instrument", contentClass: "tabInsturment", hidden: this.isEditing },
            { no: 2, name: "Limits", contentClass: "tabLimits", disabled: !this.isEditing },
            { no: 3, name: "Setting (optional)", contentClass: "tabSettings", disabled: !this.isEditing }
        ];
    }

    private initSettingsForm(popup: boolean, mail: boolean, sms: boolean, remark: string) {
        this.notifyPopupDefaultValue = popup;
        this.notifyMailDefaultValue = mail;
        this.notifySMSDefaultValue = sms;
        this.remarkDefaultValue = remark;
    }

    private async loadChartEdit() {
        this.initEditButtons();

        this.editedObj = await this._alertsDataSvc.getByIdAsync(this.editedId);

        let instrumentId = this.editedObj.instrument.id;
        let exchangeId = this.editedObj.exchange.id;

        this.buildTitleAsync(exchangeId, instrumentId);

        this.ticksData = await this.getChartDataAsync(exchangeId, instrumentId);

        this.buildLimitValuesEdit();

        let options = await this.buildChartOptions(exchangeId, instrumentId, this.upperLimit, this.lowerLimit);

        await this.chartComponent.createChart(options);

        this.setChartYAxis(this.upperLimit, this.lowerLimit);

        this.initSettingsForm(this.editedObj.actClient, this.editedObj.actEmail, this.editedObj.actSms, this.editedObj.remarks);
    }

    private async loadChartCreate(instrument: Instrument) {        
        this.ticksData = await this.getChartDataAsync(instrument.exchangeId, instrument.id);

        if (!Utils.any(this.ticksData)) {
            this._mdlgSvc.showInfoDialog("No tick data", "This instrument cannot be loaded, no data are available.")
            return;
        }

        this.wizard.findStepByNo(2).disabled = false;
        this.wizard.findStepByNo(3).disabled = false;

        this.buildTitleAsync(instrument.exchangeId, instrument.id);

        this.initSettingsForm(true, true, true, "");

        this.buildLimitsValuesCreate();

        let options = await this.buildChartOptions(instrument.exchangeId, instrument.id, this.upperLimit, this.lowerLimit);
        await this.chartComponent.createChart(options);

        this.setChartYAxis(this.upperLimit, this.lowerLimit);

        this.wizard.moveToNext();
    }

    private buildLimitValuesEdit() {
        let upperLimitOld = parseFloat(this.editedObj.upperPrice);
        let lowerLimitOld = parseFloat(this.editedObj.lowerPrice);

        let upperSliderMin = this.roundNumber(this.lastTickPrice + 0.01, 2);
        let upperSliderMax = this.roundNumber(this.lastTickPrice + 5, 2);

        let lowerSliderMinBase = this.roundNumber(this.lastTickPrice - 5, 2);
        let lowerSliderMaxBase = this.roundNumber(this.lastTickPrice - 0.01, 2);

        let upperLimit = 0;
        let lowerLimit = 0;

        let lowerSliderMin: number;
        let lowerSliderMax: number;

        if (upperLimitOld <= this.lastTickPrice + 0.01) {
            upperLimit = upperSliderMin;
        } else {
            upperLimit = upperLimitOld;
        }

        lowerSliderMin = lowerSliderMinBase;
        if (lowerLimitOld >= this.lastTickPrice - 0.01) {
            lowerSliderMax = lowerSliderMaxBase;
            lowerLimit = lowerSliderMaxBase;
        } else {
            lowerSliderMax = this.lastTickPrice - 0.01;
            lowerLimit = lowerLimitOld;
        }

        let upperSliderDefaultIndex = ValueSliderUtils.getIndexValue(upperSliderMin, upperSliderMax, upperLimit);
        let lowerSliderDefaultIndex = ValueSliderUtils.getIndexValue(lowerSliderMin, lowerSliderMax, lowerLimit);

        let lowerSliderSteps = (lowerSliderMax - lowerSliderMin) / this.oneStep;
        let upperSliderSteps = (upperSliderMax - upperSliderMin) / this.oneStep;

        this.limitValues = {
            upperLimit,
            lowerLimit,

            upperSliderMin,
            upperSliderMax,
            upperSliderSteps,

            lowerSliderMin,
            lowerSliderMax,
            lowerSliderSteps,

            upperSliderDefaultIndex,
            lowerSliderDefaultIndex,
        };

        this.upperLimit = upperLimit;
        this.lowerLimit = lowerLimit;
    }

    private buildLimitsValuesCreate() {

        let upperLimit = this.roundNumber(this.lastTickPrice + 0.5, 2);
        let lowerLimit = this.roundNumber(this.lastTickPrice - 0.5, 2);

        let upperSliderMin = this.roundNumber(this.lastTickPrice + 0.01, 2);
        let upperSliderMax = this.roundNumber(this.lastTickPrice + 10, 2);
        let upperSliderSteps = (upperSliderMax - upperSliderMin) / this.oneStep;

        let lowerSliderMin = this.roundNumber(this.lastTickPrice - 10, 2);
        let lowerSliderMax = this.roundNumber(this.lastTickPrice - 0.01, 2);
        let lowerSliderSteps = (lowerSliderMax - lowerSliderMin) / this.oneStep;

        let upperSliderDefaultIndex = ValueSliderUtils.getIndexValue(upperSliderMin, upperSliderMax, upperLimit);
        let lowerSliderDefaultIndex = ValueSliderUtils.getIndexValue(lowerSliderMin, lowerSliderMax, lowerLimit);

        this.limitValues = {
            upperLimit,
            lowerLimit,

            upperSliderMin,
            upperSliderMax,
            upperSliderSteps,

            lowerSliderMin,
            lowerSliderMax,
            lowerSliderSteps,

            upperSliderDefaultIndex,
            lowerSliderDefaultIndex
        };

        this.upperLimit = upperLimit;
        this.lowerLimit = lowerLimit;
    }

    private async createNewAlert() {
        let settingsVals = this.settingsForm.getValuesJson<SettingsFormVM>();

        let req: AlertCreateRequest = {
            e: this.selectedInsturment.exchangeId,
            i: this.selectedInsturment.id,
            upper: this.upperLimit,
            lower: this.lowerLimit,
            email: settingsVals.notifyMail,
            sms: settingsVals.notifySMS,
            client: settingsVals.notifyPopup,
            remarks: settingsVals.remark,
            callback: false
        };

        await this._alertsDataSvc.createAsync(req);
        this.onListChange.emit();
        this.parentWin.close();
    }

    private async updateAlert() {
        let settingsVals = this.settingsForm.getValuesJson<SettingsFormVM>();

        let req: AlertUpdateRequest = {
            upper: this.upperLimit,
            lower: this.lowerLimit,
            email: settingsVals.notifyMail,
            sms: settingsVals.notifySMS,
            client: settingsVals.notifyPopup,
            remarks: settingsVals.remark,
            callback: false
        };

        await this._alertsDataSvc.updateAsync(this.editedId, req);
        this.onListChange.emit();
        this.parentWin.close();
    }

    private initEditButtons() {
        let win = this.parentWin;

        win.buttonsManager.addCloseButton();

        this.updateBtn = win.buttonsManager.addEasyButton("Update", () => {
            this.updateAlert();
        });        
    }

    private nextBtn: DialogButton;
    private createBtn: DialogButton;
    private updateBtn: DialogButton;

    private initCreateButtons() {
        let win = this.parentWin;

        win.buttonsManager.addCloseButton();

       this.nextBtn = win.buttonsManager.addEasyButton("Next (optional)", () => {
            this.wizard.moveToNext();
        });

        this.createBtn = win.buttonsManager.addEasyButton("Create", () => {
            this.createNewAlert();
        });
    }

    private setButtonsByStepNo(no: number) {
        this.parentWin.buttonsManager.hideAllButtonsExceptClose();

        if (no === 2) {

            this.createBtn.visible = true;
            this.nextBtn.visible = true;            
        }

        if (no === 3) {
            this.updateBtn.visible = true;            
        }
    }

    private async buildTitleAsync(exchangeId: number, instrumentId: number) {
        if (!this.origTitle) {
            this.origTitle = this.parentWin.title;
        }

        //loads data
        await this._tradableSvc.getValueAsync();

        let idata = this._tradableSvc.getInstrumentDataById(exchangeId, instrumentId);
        this.parentWin.title = `${this.origTitle} - ${idata.exchange.exchange.name} - ${idata.vtp.name} - ${idata.instrument.instrument.symbol}`;
    }

    public onStepChange(step: WizardStep) {

        if (!this.isEditing) {
            this.setButtonsByStepNo(step.no);
        }

    }

    private async getChartDataAsync(exchangeId, instrumentId) {
        let items = await this._ticksSvc.getTickDataMappedAsync(exchangeId, instrumentId);

        let outItems = _.map(items, (i) => { return [i.created, i.price] });
        return outItems;
    }

    public upperLimitChanged(value: number) {
        this.limitValueChanged(value, true, true);
    }

    public lowerLimitChanged(value: number) {
        this.limitValueChanged(value, false, true);
    }

    public sliderUpperLimitChanged(values: ValueSliderResult) {
        let realValue = ValueSliderUtils.getRealValue(this.limitValues.upperSliderMin, this.limitValues.upperSliderMax, values.index);
        this.limitValueChanged(realValue, true, false);
    }

    public sliderLowerLimitChanged(values: ValueSliderResult) {
        let realValue = ValueSliderUtils.getRealValue(this.limitValues.lowerSliderMin, this.limitValues.lowerSliderMax, values.index);
        this.limitValueChanged(realValue, false, false);
    }

    private limitValueChanged(value: number, isUpper: boolean, fromNumberInput: boolean) {
        let fixedValue = this.roundNumber(value, 2);

        if (isUpper) {
            this.upperLimit = this.roundNumber(fixedValue, 2);
            this.setChartYAxis(fixedValue, null);
        } else {
            this.lowerLimit = this.roundNumber(fixedValue, 2);
            this.setChartYAxis(null, fixedValue);
        }

        if (fromNumberInput) {
            if (isUpper) {
                let index = ValueSliderUtils.getIndexValue(this.limitValues.upperSliderMin, this.limitValues.upperSliderMax, fixedValue);
                this.upperSlider.setIndex(index, false);
            } else {
                let index = ValueSliderUtils.getIndexValue(this.limitValues.lowerSliderMin, this.limitValues.lowerSliderMax, fixedValue);
                this.lowerSlider.setIndex(index, false);
            }
        } else {
            if (isUpper) {
                this.upperInputNumber.setValue(fixedValue, false);
            } else {
                this.lowerInputNumber.setValue(fixedValue, false);
            }
        }
    }

    private roundNumber(number, digits) {
        var multiple = Math.pow(10, digits);
        var rndedNum = Math.round(number * multiple) / multiple;
        return rndedNum;
    }

    private setChartYAxis(upper, lower) {
        if (!this.firstYaxis) {
            return;
        }

        if (lower === null) {
            this.firstYaxis.removePlotLine('upper_limit');

            let upperline = {
                id: 'upper_limit',
                value: upper,
                color: 'green',
                dashStyle: 'shortdash',
                width: 2,
                label: {
                    text: `Oberes Limit: ${upper}`,
                    style: { color: 'green' }
                }
            };

            this.firstYaxis.addPlotLine(upperline);
        } else {
            this.firstYaxis.removePlotLine('lower_limit');

            let lowerline = {
                id: 'lower_limit',
                value: lower,
                color: 'red',
                dashStyle: 'shortdash',
                width: 2,
                label: {
                    text: `Unteres Limit: ${lower}`,
                    style: { color: 'red' }
                }
            };
            this.firstYaxis.addPlotLine(lowerline);
        }

        this.setExtremes(true);
    }

    
    private setExtremes(redraw) {
        //todo: possibly take from dataset, not from component!
        let extremes = this.firstYaxis.getExtremes();                
        let max = extremes.dataMax;
        let min = extremes.dataMin;

        if (this.upperLimit > max) {
            max = this.upperLimit;
        }
        if (this.lowerLimit < min) {
            min = this.lowerLimit;
        }

        this.firstYaxis.setExtremes(min, max, false, false);

        if (redraw) {
            this.chartComponent.instance.redraw();
        }
    }

    private async buildChartOptions(exchangeId, instrumentId, upper, lower) {

        let chartYAxis = [{
            title: { text: 'in €/MWh' },
            offset: 20,
            plotLines: [
                {
                    id: 'upper_limit',
                    value: upper,
                    color: 'green',
                    dashStyle: 'shortdash',
                    width: 2,
                    label: {
                        text: 'Oberes Limit: ' + upper
                        , style: { color: 'green' }
                    }
                }, {
                    id: 'lower_limit',
                    value: lower,
                    color: 'red',
                    dashStyle: 'shortdash',
                    width: 2,
                    label: {
                        text: 'Unteres Limit: ' + lower
                        , style: { color: 'red' }
                    }
                }]
        }];

        let chartSeries = [
            {
                name: 'Letz. Kurs',
                data: this.ticksData,
                tooltip: {
                    valueDecimals: 2
                }
                , animation: false
            }];

        let chartOption = {
            chart: {
                shadow: false,
                spacingTop: 20,
                spacingRight: 10,
                spacingLeft: 10,
                width: 590,
                height: 320,
                animation: false
            },
            credits: { enabled: false },
            rangeSelector: {
                enabled: false
            },
            series: chartSeries,
            yAxis: chartYAxis,
            exporting: { enabled: false },
            navigator: { height: 25 }

        };

        return chartOption;
    }

}


interface LimitValues {
    upperLimit: number,
    lowerLimit: number,
    upperSliderMin: number,
    upperSliderMax: number,
    lowerSliderMin: number,
    lowerSliderMax: number,
    upperSliderSteps: number,
    lowerSliderSteps: number,
    upperSliderDefaultIndex: number,
    lowerSliderDefaultIndex: number
}

interface SettingsFormVM {
    notifyPopup: boolean;
    notifyMail: boolean;
    notifySMS: boolean;
    remark: string;
}

