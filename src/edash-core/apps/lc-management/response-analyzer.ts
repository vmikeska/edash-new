import { LcParsingResponse } from "./lc-file.service";
import { LoadcurveInputType, AnalyseReportData } from "./lc-types";

export class ResponseAnalyzer {

    public analyse(data: LcParsingResponse) {

        if (!data.values) {
            return null;
        }

        let errors = 0;
        let allData = [];
        let rows = 0;
        let sumValues = 0;

        for (let i = 0; i < data.values.length; i++) {
            let val = data.values[i];
            let error = '';

            if (val.e) {
                if (val.e != null) {
                    error = val.e;
                    errors++;
                }
            }

            let row = {
                id: i,
                validity: val.v,
                amount: val.a,
                error: error
            };
            sumValues += row.amount;
            allData.push(row);
            rows++;
        }

        let res: AnalyseResult = { errors, allData, rows, sumValues };
        return res;
    }

    public parseResults(analyseResult: AnalyseResult, parsingResponse: LcParsingResponse) {
        let data: AnalyseReportData = {
            intervalText: this.getIntervalText(parsingResponse.interval),
            rollableText: this.getRollableText(parsingResponse.rollable),
            errorsCount: analyseResult.errors,
            rowsCount: analyseResult.rows,
            sum: this.formatDataForScreen(analyseResult.sumValues, 2)
        };

        return data;
    }

    private setFormSuccess(data: LcParsingResponse, rowsRes: AnalyseResult) {
        let rollableText = this.getRollableText(data.rollable);
        let intervalText = this.getIntervalText(data.interval);

        if (rowsRes.errors == 0) {
            //enable save tab

            //rows - Zeilen
            //intervalText - Intervall
            //rollableText - Ausrollen
            //errors - Probleme

            //this.formatDataForScreen(sumValues, 2) - Summe der Werte

            if (data.rollable) {
                //disable Ausrollen checkbox                    
            } else {
                //enable and check Ausrollen checkbox                    
            }

        } else {
            //enable analyse tab

            // widgets.wizardWnd.tab.tab5.grid.source.localdata = wizard.allData;
            // widgets.wizardWnd.tab.tab5.grid.dataAdapter.dataBind();                
            // $("#" + widgets.wizardWnd.tab.tab5.table.rows.id).text(wizard.rows);
            // $("#" + widgets.wizardWnd.tab.tab5.table.interval.id).text(intervalText);
            // $("#" + widgets.wizardWnd.tab.tab5.table.sumValue.id).text(formatDataForScreen(wizard.sumValues, 2));
            // $("#" + widgets.wizardWnd.tab.tab5.table.rollable.id).text(rollableText);
            // $("#" + widgets.wizardWnd.tab.tab5.table.errors.id).text(wizard.errors);
            // widgets.wizardWnd.tab.widget.jqxTabs('select', wizard.tab.analyse);
        }
    }

    private setRowUnsuccess(fromTab: LoadcurveInputType) {
        switch (fromTab) {
            //data.message -here error message

            case LoadcurveInputType.Text:
                // widgets.wizardWnd.tab.tab2.uploadError.widget.show();

                break;
            case LoadcurveInputType.Custom:
                // widgets.wizardWnd.tab.tab4.uploadError.widget.show();

                break;
            case LoadcurveInputType.Standard:
                // widgets.wizardWnd.tab.tab3.uploadError.widget.show();

                break;
        }
    }

    //todo: mayber these move to final-save-content

    public formatDataForScreen(num, digits) {
        if (typeof num != 'number') {
            num = parseFloat(num);
        }

        //todo: finish formating
        // var str = $.number(num, digits, ',', '.');
        // return str;

        return num.toString();
    }

    public getRollableText(rollable) {
        return rollable ? 'möglich' : 'unmöglich';;
    }

    public getIntervalText(interval) {
        switch (interval) {
            case 'MONTHS':
                return 'Monatswerte';
            case 'DAYS':
                return 'Tageswerte';
            case 'HOURS':
                return 'Stundenwerte';
            case 'QUARTERHOURS':
                return '15min Werte';
        }

        return 'unknown value';
    }
}

export interface AnalyseResult {
    errors: number;
    allData: RowResult[];
    rows: number;
    sumValues: number;
}

export interface RowResult {
    id: number;
    validity: string;
    amount: number;
    error: string;
}