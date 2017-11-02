import { Injectable } from "@angular/core";
import { HistoryChartComponent } from "../history-chart/history-chart.component";
import { AppWin } from "../../../desktop/components/base-window.component";
import { AppBuildingService } from "../../../desktop/services/app-building.service";



@Injectable()
export class HistoryChartFactoryService {

    constructor(private _winBuildSvc: AppBuildingService) {

    }

    public instance(params: any = null) {

        let insts;

        if (params) {
            insts = this.openHistoryChart((comp) => {
                comp.tabsComp.startOpened = false;
            })
            let inst = <HistoryChartComponent>insts;

            inst.loadInstrument(params.exchangeId, params.instrumentId);
        } else {
            insts = this.openHistoryChart();
        }

        return insts;        
    }

    private openHistoryChart(
        initCompModel: (model: HistoryChartComponent) => void = null,
        initWinModel: (model: AppWin) => void = null) {
        let insts = this._winBuildSvc.activateWin<HistoryChartComponent>(HistoryChartComponent,
            (inst) => {
                inst.isSingleton = false;

                if (initCompModel) {
                    initCompModel(inst);
                }
            },
            (inst) => {
                inst.title = "History chart";
                this._winBuildSvc.buildWinModel(inst, 600, 400);

                if (initWinModel) {
                    initWinModel(inst);
                }
            });

        return insts;
    }


}