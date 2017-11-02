
import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { DlgContentBase } from '../../../desktop/components/dlg-content-base';
import { WizardStep, WizardComponent } from '../../../desktop/controls/wizard.component';
import { LcParsingResponse, LcExcelFileRequest, LcFileService } from './lc-file.service';
import { ResponseAnalyzer, AnalyseResult } from './response-analyzer';
import { ControlsForm } from '../../../desktop/forms/ControlsForm';
import { SaveResult } from './wizard-contents/final-save-content.component';
import { LoadcureveRequest, LcMgmtDataService } from './lc-mgmt-data.service';
import { LoadcurveInputType, LcWizardStepName, AnalyseReportData } from './lc-types';
import { ParseValuesForm } from './wizard-contents/parse-values-content.component';
import { DialogButton } from '../../../desktop/components/modal-dialog.component';

@Component({
    selector: 'lc-wizard-dlg',
    templateUrl: 'lc-wizard-dlg.html'
})

export class LcWizardComponent extends DlgContentBase {
    constructor(private _dataSvc: LcMgmtDataService, private _fileSvc: LcFileService) {
        super();
    }

    protected onInit() {
        this.createForms();

        this.createButtons();
    }

    @ViewChild('wizard')
    private wizard: WizardComponent;

    public wizardSteps: WizardStep[] = [];

    public LcWizardStepName = LcWizardStepName;

    public selectedType?: LoadcurveInputType = null;
    public activeStep = LcWizardStepName.TypeSelection;    

    public analyseResult: AnalyseResult;
    public parsingResponse: LcParsingResponse;
    public analyseData: AnalyseReportData;

    private nextBtn: DialogButton;
    private createBtn: DialogButton;

    public finalSaveForm: ControlsForm;
    public parseValuesForm: ControlsForm;

    private analyseStepNo: number;
    private saveStepNo: number;

    public onFinished = new EventEmitter();

    public typeSelected(type: LoadcurveInputType) {
        this.selectedType = type;

        if (type === LoadcurveInputType.Standard) {
            this.activeStep = LcWizardStepName.StandardFileUpload;
        }

        if (type === LoadcurveInputType.Custom) {
            this.activeStep = LcWizardStepName.CustomFileUpload;
        }

        if (type === LoadcurveInputType.Text) {
            this.activeStep = LcWizardStepName.Text;
        }

        this.setWizardsSteps();
        setTimeout(() => {
            this.switchStep(1);
        })

    }

    private createForms() {
        this.finalSaveForm = this.formsManager.createForm();
        this.finalSaveForm.onValueChanged.subscribe(() => {
            let valid = this.parseValuesForm.isValid;
            this.setButtonsVisiblity(false, valid);
        })


        this.parseValuesForm = this.formsManager.createForm();
        this.parseValuesForm.onValueChanged.subscribe(() => {
            let valid = this.parseValuesForm.isValid;
            this.setButtonsVisiblity(valid, false);
        });
    }

    public onStepChange(step: WizardStep) {
        
    }

    private inputedText: string;
    private customFile: File;

    public onTextInput(text: string) {
        this.inputedText = text;
        let hasText = text.length > 0;
        this.setButtonsVisiblity(hasText, false);
    }

    private createButtons() {

        let bmgr = this.parentWin.buttonsManager;

        this.createBtn = bmgr.addEasyButton("Create", () => { this.createItemAsync(); });
        this.createBtn.visible = false;

        this.nextBtn = bmgr.addEasyButton("Next", () => { this.nextClicked(); });
        this.nextBtn.visible = false;            
    }

    private nextClicked() {

        if (this.activeStep === LcWizardStepName.ParseValues) {
            this.parseCustomAsync();
        }

        if (this.activeStep === LcWizardStepName.Analyse) {            
            this.activeStep = LcWizardStepName.FinalSave;
            this.switchStep(this.saveStepNo);
            this.setButtonsVisiblity(false, true);
        }

        if (this.activeStep == LcWizardStepName.Text) {
            this.parseTextAsync();
        }
    }

    private async parseTextAsync() {
        let res = await this._fileSvc.parseTextAsync(this.inputedText)
        
        this.setNewStepAfterUpload(res);
    }

    private async parseCustomAsync() {
        let formVals = this.parseValuesForm.getValuesJson<ParseValuesForm>();

        let req: LcExcelFileRequest = {
            dateColumn: formVals.date,
            timeColumn: formVals.time,
            excelSheet: formVals.sheetNo,
            file: this.customFile,
            firstDataRow: formVals.firstDataRow,
            valueColumn: formVals.volume,            
            workUnit: "MW"
        };

        let res = await this._fileSvc.parseExcelAsync(req);

        this.setNewStepAfterUpload(res);
    }

    public standardFileUploaded(res: LcParsingResponse) {
        this.setNewStepAfterUpload(res);
    }

    public setNewStepAfterUpload(res: LcParsingResponse) {
        this.processParsingResponse(res);

        if (this.analyseResult) {
            if (this.analyseResult.errors == 0) {
                this.switchStep(this.saveStepNo);
                this.activeStep = LcWizardStepName.FinalSave;
                this.setButtonsVisiblity(false, false);
            } else {
                this.switchStep(this.analyseStepNo);
                this.activeStep = LcWizardStepName.Analyse;
            }
        } else {
            //todo: show error
        }

    }

    public processParsingResponse(res: LcParsingResponse) {
        this.parsingResponse = res;
        let ra = new ResponseAnalyzer();
        this.analyseResult = ra.analyse(res);
        this.analyseData = ra.parseResults(this.analyseResult, this.parsingResponse);
    }

    public customFileUploaded(file: File) {
        this.customFile = file;
        this.activeStep = LcWizardStepName.ParseValues;
        this.switchStep(2);
    }

    private async createItemAsync() {
        let form = this.finalSaveForm.getValuesJson<any>();

        let saveVals: SaveResult = {
            clusterId: form.cluster[0].value,
            description: form.description,
            roll: form.roll,
            time: form.time[0].value,
            units: form.units[0].value,
            vtp: form.vtp[0].value
        };

        let req: LoadcureveRequest = {
            clusterId: saveVals.clusterId,
            intervalUnit: this.parsingResponse.interval,
            isFromValue: saveVals.time,
            name: saveVals.description,
            rollout: saveVals.roll,
            vtp: saveVals.vtp,
            workUnit: saveVals.units,
            values: this.analyseResult.allData
        };

        await this._dataSvc.postAsync(req);
        this.onFinished.emit();
        this.parentWin.close();
    }

    public setButtonsVisiblity(next: boolean, create: boolean) {
        this.nextBtn.visible = next;
        this.createBtn.visible = create;
    }

    private setWizardsSteps() {
        if (this.selectedType === LoadcurveInputType.Standard) {
            this.wizardSteps = [
                { name: "File selection", no: 1 },
                { name: "Analyse", no: 2 },
                { name: "Speichern", no: 3 },
            ];

            this.analyseStepNo = 2;
            this.saveStepNo = 3;
        }

        if (this.selectedType === LoadcurveInputType.Custom) {
            this.wizardSteps = [
                { name: "File selection", no: 1 },
                { name: "Fields definition", no: 2 },
                { name: "Analyse", no: 3 },
                { name: "Speichern", no: 4 },
            ];

            this.analyseStepNo = 3;
            this.saveStepNo = 4;
        }

        if (this.selectedType === LoadcurveInputType.Text) {
            this.wizardSteps = [
                { name: "Text paste", no: 1 },
                { name: "Analyse", no: 2 },
                { name: "Speichern", no: 3 },
            ];

            this.analyseStepNo = 2;
            this.saveStepNo = 3;
        }

    }

    private switchStep(no: number) {
        this.wizardSteps.forEach((s) => {
            if (s.no === no) {
                s.disabled = false;
                this.wizard.activateTabByNo(no);
            } else {
                s.disabled = true;
            }
        })
    }

}

