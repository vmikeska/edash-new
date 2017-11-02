import { Injectable } from "@angular/core";
import { RealTimeChartComponent } from "../realtime-chart/real-time-chart.component";
import { AppBuildingService } from "../../../desktop/services/app-building.service";
import { AppWin } from "../../../desktop/components/base-window.component";




@Injectable()
export class RealTimeChartFactoryService {

    constructor(private _winBuildSvc: AppBuildingService) {

    }

    public instance(params: any = null) {
        let insts;
        
        if (params) {
            insts = this.openRealTimeChart((comp) => {
                comp.tabsComponent.startOpened = false;
            });
            let inst = <RealTimeChartComponent>insts;

            inst.initAsync(params.exchangeId, params.instrumentId);
        } else {
            insts = this.openRealTimeChart();
        }

        return insts;        
    }

    private openRealTimeChart(
        initCompModel: (model: RealTimeChartComponent) => void = null,
        initWinModel: (model: AppWin) => void = null) {

        let insts = this._winBuildSvc.activateWin<RealTimeChartComponent>(RealTimeChartComponent,
            (inst) => {
                inst.isSingleton = false;

                if (initCompModel) {
                    initCompModel(inst);
                }
            },
            (inst) => {
                inst.title = "Real-time chart";
                this._winBuildSvc.buildWinModel(inst, 600, 400)

                if (initWinModel) {
                    initWinModel(inst);
                }
            });

        return insts;
    }


}