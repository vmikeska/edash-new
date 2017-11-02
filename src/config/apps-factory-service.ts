import { Injectable } from "@angular/core";
import { WinContentBase } from "../desktop/components/win-content-base";
import { HistoryChartFactoryService } from "../edash-core/apps/history-chart/history-chart-factory.service";
import { RealTimeChartFactoryService } from "../edash-core/apps/realtime-chart/real-time-chart-factory.service";
import { QuotePageFactoryService } from "../edash-core/apps/quote-page/quote-page-factory.service";
import { MarketNewsFactoryService } from "../edash-core/apps/market-news/market-news-factory.service";
import { OrdersFactoryService } from "../edash-core/apps/orders/orders-factory.service";
import { EodFactoryService } from "../edash-core/apps/eod-data/eod-factory.service";
import { AlertsFactoryService } from "../edash-core/apps/alerts/alerts-factory.service";
import { LcManagementFactoryService } from "../edash-core/apps/lc-management/lc-management-factory.service";
import { ControlsFormFactoryService } from "../edash-core/apps/test/controls-form-factory.service";




@Injectable()
export class AppsFactoryService {

    constructor(        
        private _histChartFactorySvc: HistoryChartFactoryService,
        private _realChartFactorySvc: RealTimeChartFactoryService,
        private _quotePageFactorySvc: QuotePageFactoryService,
        private _mareketNewsFactorySvc: MarketNewsFactoryService,
        private _ordersFactorySvc: OrdersFactoryService,
        private _eodFactorySvc: EodFactoryService,
        private _alertsFactorySvc: AlertsFactoryService,
        private _lcMgmnt: LcManagementFactoryService,
        private _controlsTestFactorySvc: ControlsFormFactoryService
    ) {

    }

    public createApp(id: string, params: any = null) {

        let insts: WinContentBase;

        if (id === "RTDATA") {
            insts = this._quotePageFactorySvc.instance(params);
        }

        if (id === "RTCHART") {
            insts = this._realChartFactorySvc.instance(params);
        }

        if (id === "HIST_CHART") {
            insts = this._histChartFactorySvc.instance(params);           
        }

        if (id === "EMS") {
            insts = this._mareketNewsFactorySvc.instance(params);            
        }


        if (id === "ORDERS") {
            insts = this._ordersFactorySvc.instance(params);
        }


        if (id === "EOD") {
            insts = this._eodFactorySvc.instance(params);
        }

        if (id === "ALERTS") {
            insts = this._alertsFactorySvc.instance(params);
        }

        if (id === "LCUPLOAD") {
            insts = this._lcMgmnt.instance(params);
        }

        if (id === "TEST_PAGE") {
            insts = this._controlsTestFactorySvc.instance(params);
        }

        

        

        

        

        // if (id === "PORTFOLIO") {
        //     insts = this._winBuildSvc.activateWin<PortfolioComponent>(PortfolioComponent);
        // }


        // if (type === DebugWinComponent) {
        //     insts = this._winBuildSvc.activateWin<DebugWinComponent>(DebugWinComponent,
        //         (inst) => {
        //             inst.isSingleton = true;
        //         },
        //         (inst) => {
        //             inst.title = "Debug";
        //             this._winBuildSvc.buildWinModel(inst, 300, 200)
        //         });
        // }

        return insts;
    }

    

    


}


