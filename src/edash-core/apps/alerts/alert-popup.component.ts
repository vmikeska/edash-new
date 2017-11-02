
import { Component, OnInit, ViewChild } from '@angular/core';
import { DlgContentBase } from '../../../desktop/components/dlg-content-base';
import { StockChartComponent } from '../../highcharts/stock-chart.component';
import { AlertsDataService, AlertResponse } from '../../services/alerts-data.service';
import { TickVM, TickDataService } from './tick-data.service';
import { Utils } from '../../../common/Utils';

@Component({
    selector: 'alert-popup',
    templateUrl: 'alert-popup.html'
})

export class AlertPopupComponent extends DlgContentBase {
    constructor(private _ticksSvc: TickDataService, private _alertsDataSvc: AlertsDataService) {
        super();
    }


    private upper: boolean;

    public alert: AlertResponse;

    @ViewChild("chartComponent")
    public chartComponent: StockChartComponent;

    public async initAsync(alertId: number, upper: boolean) {

        this.parentWin.buttonsManager.addCloseButton();

        this.upper = upper;

        this.alert = await this._alertsDataSvc.getByIdAsync(alertId);

        let ticks = await this._ticksSvc.getTickDataMappedAsync(this.alert.exchange.id, this.alert.instrument.id);

        let ticksResult = this.processTicks(ticks);

        this.parentWin.title = `Alert - ${this.alert.instrument.symbol} - ${this.alert.instrument.vtp} - ${this.alert.exchange.name}`;

        let options = this.buildOptions(this.alert, this.upper, ticksResult.data);

        await this.chartComponent.createChart(options);
    }

    private processTicks(ticks: TickVM[]) {
        let data: [number, number][] = [];
        let lowest: number;
        let highest: number;

        for (var i = 0; i < ticks.length; i++) {
            let tick = ticks[i];

            let isFirst = (i === 0);
            let isLast = (i == ticks.length - 1);

            if (isFirst) {
                lowest = tick.created;
            }

            if (isLast) {
                let diff = (tick.created - lowest) * 0.15;
                highest = tick.created + diff;
            }

            data.push([tick.created, tick.price]);            
        }

        let res: TicksResult = { data, lowest, highest };
        return res;
    }

    private buildOptions(alert: AlertResponse, upper: boolean, data: [number, number][]) {

        let yaxis = [
            {
                title: {
                    text: 'letzter Kurs'
                },
                height: 150,
                plotLines: [
                    {
                        value: upper ? alert.upperPrice : alert.lowerPrice,
                        id: 'Limit',
                        color: 'red',
                        dashStyle: 'shortdash',
                        width: 2,
                        label: {
                            text: upper ? `oberes Limit: ${alert.upperPrice}` : `unteres Limit: ${alert.lowerPrice}`,
                            style: { color: '#FF0000' }
                        }
                    }]
            },
            {
                title: {
                    text: 'Stück'
                },
                top: 220,
                height: 40,
                startOnTick: true,
                endOnTick: true,
                min: 0,
                max: 5
            }
        ];

        let flagValue = upper ? this.getDateTimeUTC(alert.upperPassed) : this.getDateTimeUTC(alert.lowerPassed);

        let options = {
            chart: {
                events: {
                    load: () => {
                        // if (ed.sound.enabled) {
                        //     ion.sound.play('win', { volume: ed.sound.volume });
                        // }
                    }
                },
                animation: false,

                margin: 60,
                width: 595,
                height: 330
            },
            legend: {
                enabled: true,
                shadow: true,
                y: 10
            },
            navigator: {
                enabled: false
            },
            rangeSelector: {
                enabled: false
            },
            credits: { enabled: false },
            scrollbar: {
                enabled: false
            },
            exporting: { enabled: false },           
            yAxis: yaxis,
            series: [{
                animation: true,
                name: 'Letzter Kurs',
                data: data,
                id: 'LastPrice',
                marker: {
                    enabled: true,
                    radius: 3
                },
                shadow: true,
                tooltip: {
                    valueDecimals: 2
                }
            },
            {
                type: 'flags',
                name: 'Limit Durchbruch',
                data: [{
                    x: flagValue,
                    title: 'D'
                }
                ],
                onSeries: 'LastPrice',
                shape: 'circlepin',
                width: 16
            }],
            xAxis: [{
                startOnTick: false,
                endOnTick: false,
                minPadding: 0.8,
                maxPadding: 0.8,
                ordinal: true
            }]
        };

        return options;
    }

    //todo: change to moment
    private getDateTimeUTC(dateTime) {
        var UTC_Date;
        try {
            UTC_Date = Date.UTC(
                dateTime.getUTCFullYear()
                , dateTime.getUTCMonth()
                , dateTime.getUTCDate()
                , dateTime.getUTCHours() + 1
                , dateTime.getUTCMinutes()
                , dateTime.getUTCSeconds()
            );
        }
        catch (e) {
            //console.log(dateTime);
        }
        return UTC_Date;
    }

    //called after ticks loaded
    private setPopupExtremes(lowest, highest) {
        // PopupChart.xAxis[0].setExtremes(lowest, highest);
    }
}

interface TicksResult {
    data: [number, number][];
    lowest: number;
    highest: number;
}