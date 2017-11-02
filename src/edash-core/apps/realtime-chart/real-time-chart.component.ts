
import { Component, ViewChild, OnInit, ElementRef } from "@angular/core";
import { ChartModule, ChartComponent } from 'angular2-highcharts';
import { Http } from "@angular/http";
import { RtChartSubscriptionService, RtSubscriptionSvcInstance } from "./rt-chart-subscription.service";
import { WinContentBase } from "../../../desktop/components/win-content-base";
import { ApiCommService } from "../../services/api-comm.service";
import { TradableInstrumentsService } from "../../services/tradable-instruments.service";
import { TabsMenuComponent } from "../../../desktop/controls/tabs-menu.component";
import { TabItem } from "../../../desktop/controls/tabs.component";
import { Instrument } from "../../services/exchange-response";
import { StockChartComponent } from "../../highcharts/stock-chart.component";



declare var Highcharts;

@Component({
    selector: 'real-time-chart',
    templateUrl: './real-time-chart.html',
})

export class RealTimeChartComponent extends WinContentBase {

    constructor(
        private _apiComm: ApiCommService,
        private _updateSvc: RtChartSubscriptionService,
        private _tradableSvc: TradableInstrumentsService

    ) {
        super();
    }

    @ViewChild("chartComponent")
    public chartComponent: StockChartComponent;

    @ViewChild("tabsComp")
    public tabsComponent: TabsMenuComponent;

    @ViewChild('chartCont')
    private chartCont: ElementRef;


    private exchangeId;
    private instrumentId;
    
    private execPriceTicks = [];
    private subscriptionInstance: RtSubscriptionSvcInstance;

    public tabs: TabItem[] = [
        { id: "tiInstruments", name: "Instruments" },
        { id: "tiConfig", name: "Gesp. Konfiguartion" }
    ];

    private createSubscription() {
        this.subscriptionInstance = this._updateSvc.getOrCreateInstance(this.parentWin.id, this.exchangeId, this.instrumentId);
        this.subscriptionInstance.onItemUpdate.subscribe((e) => {

            let point = [e.date, e.last];
            this.chartComponent.instance.series[0].addPoint(point, true);
        });
    }

    public async onInstrumentSelected(e: Instrument) {      
        this.initAsync(e.exchangeId, e.id);

        this.parentWin.title = this.buildTitleText(e.exchangeId, e.id);
    }

    public onBeforeClose() {
        this._updateSvc.unsubscrible(this.parentWin.id);
    }

    public async initAsync(exchangeId, instrumentId) {

        if (this.subscriptionInstance) {
            this._updateSvc.unsubscrible(this.parentWin.id);
        }

        this.exchangeId = exchangeId;
        this.instrumentId = instrumentId;

        this.parentWin.title = this.buildTitleText(exchangeId, instrumentId);

        await this.loadTicks();

        this.chartComponent.createChart(this.chartOptions);

        this.createSubscription();
    }

    private buildTitleText(exchangeId, id) {
        
        let insData = this._tradableSvc.getInstrumentDataById(exchangeId, id);

        let segmentKey = this._tradableSvc.buildSegmentName(insData.vtp.name, insData.loadPeriod.name);

        let txt = `Echtzeit chart - HP: ${insData.exchange.exchange.name}, VHP: ${segmentKey}, Produkt: ${insData.instrument.instrument.symbol}`;
        return txt;
    }

    private get chartOptions() {

        let chartYAxis = [{
            title: { text: 'in €/MWh' },
            offset: 30
        }];

        let chartSeries = [
            {
                name: 'Letz. Kurs',
                data: this.execPriceTicks,
                tooltip: {
                    valueDecimals: 2
                },
                marker: {
                    enabled: true,
                    radius: 3
                },
                type: 'spline'
            }];

        let buttons = [{
            type: 'second',
            count: 30,
            text: '30s'
        }, {
            type: 'minute',
            count: 1,
            text: '1m'
        }, {
            type: 'minute',
            count: 10,
            text: '10m'
        }, {
            type: 'minute',
            count: 30,
            text: '30m'
        }, {
            type: 'minute',
            count: 60,
            text: '1h'
        }, {
            type: 'all',
            text: 'Alle'
        }];


        let chartOption = {                   
            credits: { enabled: false },
            rangeSelector: {
                inputBoxStyle:
                {
                    right: '20px'
                },
                selected: 3,
                buttons: buttons
            },
            series: chartSeries,
            yAxis: chartYAxis,
            plotOptions: {
                series: {
                    animation: {
                        duration: 2000
                    }
                }
            }
        }

        return chartOption;
    }

    private async loadTicks() {

        this.execPriceTicks = [];

        let prms = {
            e: this.exchangeId,
            i: this.instrumentId,
            limit: 1000
        };

        let results = await this._apiComm.apiGetAsync<RtDataItemResponse[]>("history/tick", prms);

        results.forEach((result) => {
            let price = parseFloat(result.executionPrice);
            this.execPriceTicks.push([result.createdUtc, price]);
        })
    }


}

export class RtDataItemResponse {
    public createdUtc: number;
    public executionPrice: string;
    public executionQuantity: string;
}

