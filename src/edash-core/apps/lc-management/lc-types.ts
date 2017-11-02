export enum LcWizardStepName {TypeSelection, StandardFileUpload, CustomFileUpload, FinalSave, ParseValues, Analyse, Text}

export enum LoadcurveInputType { Text, Standard, Custom}

export interface AnalyseReportData {
    intervalText: string;
    rollableText: string;
    errorsCount: number;
    rowsCount: number;
    sum: number;
}