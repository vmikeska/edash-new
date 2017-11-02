
import { Component, ViewChild } from "@angular/core";
import * as moment from 'moment';
import * as _ from "lodash";
import { WinContentBase } from "../../../desktop/components/win-content-base";
import { ApiCommService } from "../../services/api-comm.service";
import { TradableInstrumentsService } from "../../services/tradable-instruments.service";
import { ResizeGridDrawer } from "../../../desktop/dragResize/GridResizing";
import { ControlsForm, ControlValueChangedEvent } from "../../../desktop/forms/ControlsForm";
import { Instrument } from "../../services/exchange-response";
import { TabItem } from "../../../desktop/controls/tabs.component";
import { TabsMenuComponent } from "../../../desktop/controls/tabs-menu.component";
import { CheckboxComponent } from "../../../desktop/controls/checkbox.component";
// import { AlertsService } from "./alerts.service";
import { ListItem } from "../../../desktop/forms/ListFormControl";
import { StockChartComponent } from "../../highcharts/stock-chart.component";
import { AlertsDataService, AlertResponse } from "../../services/alerts-data.service";


@Component({
  selector: 'history-chart',
  templateUrl: './history-chart.html',
})

export class HistoryChartComponent
  extends WinContentBase {

  constructor(
    private _apiComm: ApiCommService,
    private _tradableSvc: TradableInstrumentsService,
    private _resizing: ResizeGridDrawer,
    private _alertSvc: AlertsDataService
  ) {
    super();

  }

  protected async onInit() {

    this.limits = new LimitsDataLoader(this._alertSvc);

    this._resizing.onResizingFinished.subscribe(() => {
      this.refreshChart();
    })

    this.initForm();
  }

  @ViewChild("chartComponent")
  public chartComponent: StockChartComponent;

  public chartTypes: ListItem[] = [
    { text: "Linien-Chart", value: "line" },
    { text: "Candle Sticks", value: "candle" },
    { text: "OHLC", value: "ohlc" },
  ]

  public dataForm: ControlsForm;

  private data: HistoryChartData[];
  private groupedData = new GroupedData();
  private selectedInstrument: Instrument;

  private limits: LimitsDataLoader;

  public tabs: TabItem[] = [
    { id: "tiInstruments", name: "Instruments" },
    { id: "tiData", name: "Projection" },
    { id: "tiConfig", name: "Gesp. Konfiguartion" }
  ];

  private get chartHeight() {
    return this.chartComponent.chartHeight;
  }

  private initForm() {
    this.dataForm = this.formsManager.createForm();

    this.dataForm.onValueChanged.subscribe(async (e: ControlValueChangedEvent) => {
      this.refreshChart();
    })
  }

  private async refreshChart() {
    if (!this.selectedInstrument) {
      return;
    }

    let chartOptions = this.buildCurrentChartOptions();

    this.chartComponent.createChart(chartOptions);
  }

  private buildCurrentChartOptions() {
    let formValues = this.dataForm.getValuesJson<SelectionValuesVM>();
    let hcob = new HistChartOptionsBuilder();

    let upperLimit = null;
    let lowerLimit = null;

    let limit = this.limits.getLimitData(this.selectedInstrument.exchangeId, this.selectedInstrument.id);
    if (limit) {
      upperLimit = limit.upperLimit
      lowerLimit = limit.lowerLimit;
    }

    let chartOptions = hcob.getChartOptions(formValues, this.groupedData, this.chartHeight, upperLimit, lowerLimit);
    return chartOptions;
  }

  public async onInstrumentSelected(i: Instrument) {
    this.selectedInstrument = i;
    this.loadInstrument(i.exchangeId, i.id);
  }

  @ViewChild("tabsComp")
  public tabsComp: TabsMenuComponent;

  public async loadInstrument(exchangeId, id) {
    let instrumentData = this._tradableSvc.getInstrumentDataById(exchangeId, id);
    this.selectedInstrument = instrumentData.instrument;

    this.parentWin.title = this.buildTitleText(exchangeId, id);

    let response = await this.getData(exchangeId, id);
    this.data = this.parseDataItems(response);

    this.aggregateData();

    this.refreshChart();
  }

  private async getData(exchangeId, instrumentId) {

    let data = {
      e: exchangeId,
      i: instrumentId
    };

    let response = await this._apiComm.apiGetAsync<HistoryChartResponse[]>("history/eod", data);
    return response;
  }

  private aggregateData() {
    this.groupedData.clean();

    this.data.forEach((d) => {
      this.groupedData.closeData.push([d.tradingUtc, d.close]);
      this.groupedData.openData.push([d.tradingUtc, d.open]);
      this.groupedData.highData.push([d.tradingUtc, d.high]);
      this.groupedData.lowData.push([d.tradingUtc, d.low]);
      this.groupedData.mav38Data.push([d.tradingUtc, d.mav38]);
      this.groupedData.mav200Data.push([d.tradingUtc, d.mav200]);
      this.groupedData.cumqtyData.push([d.tradingUtc, d.cumulatedQuantity]);
      this.groupedData.tradesData.push([d.tradingUtc, d.tradesCount]);
      this.groupedData.candleData.push([
        d.tradingUtc
        , d.open
        , d.high
        , d.low
        , d.close
      ]);
    })
  }

  private parseDataItems(res: HistoryChartResponse[]) {
    let items = _.map(res, (r) => { return this.parseDataItem(r) });
    return items;
  }

  private parseDataItem(res: HistoryChartResponse) {

    let date = moment(res.tradingDate, "YYYY-MM-DD");

    let item: HistoryChartData = {
      open: parseFloat(res.open),
      high: parseFloat(res.high),
      low: parseFloat(res.low),
      close: parseFloat(res.close),
      mav38: parseFloat(res.mav38),
      mav200: parseFloat(res.mav200),
      cumulatedQuantity: parseFloat(res.cumulatedQuantity),
      tradesCount: parseInt(res.tradesCount),
      tradingUtc: res.tradingUtc,
      tradingDate: date
    };

    return item;
  }

  private buildTitleText(exchangeId, id) {
    let insData = this._tradableSvc.getInstrumentDataById(exchangeId, id);
    let segmentKey = this._tradableSvc.buildSegmentName(insData.vtp.name, insData.loadPeriod.name);

    let txt = `Historischer Chart - HP: ${insData.exchange.exchange.name}, VHP: ${segmentKey}, Produkt: ${insData.instrument.instrument.symbol}`;
    return txt;
  }

  public selectCheckboxes(select: boolean) {
    this.dataForm.controls.forEach((c) => {
      let isCheckbox = (c instanceof CheckboxComponent);
      if (isCheckbox) {
        let checkbox = <CheckboxComponent>c;
        checkbox.checked = select;
      }
    })

    this.refreshChart();
  }

}

export class LimitsDataLoader {
  private alertSvc: AlertsDataService

  constructor(alertSvc: AlertsDataService) {
    this.alertSvc = alertSvc;
    this.loadLimitsAsync();
  }

  public limits: AlertVM[];

  public async loadLimitsAsync() {
    let list = await this.alertSvc.getListAsync();
    this.limits = this.mapAlerts(list);    
  }

  public getLimitData(exchangeId, instrumentId) {
    let limit = _.find(this.limits, { exchangeId: exchangeId, instrumentId: instrumentId });

    if (limit) {
      return { upperLimit: limit.upperPrice, lowerLimit: limit.lowerPrice };
    }

    return null;
  }

  private mapAlerts(alerts: AlertResponse[]) {
    let vms = _.map(alerts, (a) => {
      let vm: AlertVM = {
        exchangeId: a.exchange.id,
        instrumentId: a.instrument.id,
        upperPrice: parseFloat(a.upperPrice),
        lowerPrice: parseFloat(a.lowerPrice)
      };
      return vm;
    });

    return vms;
  }
}

export interface AlertVM {
  instrumentId: number;
  exchangeId: number;
  upperPrice: number;
  lowerPrice: number;
}

export interface SelectionValuesVM {
  close: boolean;
  cumqty: boolean;
  mav38: boolean;
  mav200: boolean;
  trades: boolean;
  open: boolean;
  high: boolean;
  low: boolean;
  limit: boolean;
  chartType: string;
}

export class HistChartOptionsBuilder {

  private series = [];
  private yaxis = [];

  private get primaryYaxis() {
    return this.yaxis[0];
  }

  private addData(name: string, data, type = null) {
    let config = {
      name: name,
      data: data,
      tooltip: {
        valueDecimals: 2
      }
    }

    if (type) {
      config["type"] = type;
    }

    this.series.push(config);

    return config;
  }

  private buildPrimaryYaxis(values: SelectionValuesVM, upperLimit: number, lowerLimit: number) {
    let limitSelectedAndHasLimit = (values.limit && upperLimit !== null && lowerLimit !== null);

    let yaxisObj = {
      title: { text: 'in €/MWh' },
      offset: 20
    };

    if (limitSelectedAndHasLimit) {
      yaxisObj["plotLines"] = [
        {
          value: upperLimit,
          color: 'green',
          dashStyle: 'shortdash',
          width: 2,
          label: {
            text: `Oberes Limit: ${upperLimit}`,
            style: { color: 'green' }
          }
        },
        {
          value: lowerLimit,
          color: 'red',
          dashStyle: 'shortdash',
          width: 2,
          label: {
            text: `Unteres Limit: ${lowerLimit}`,
            style: { color: 'red' }
          }
        }]
    }

    this.yaxis.push(yaxisObj);
  }

  public getChartOptions(values: SelectionValuesVM, groupedData: GroupedData, chartHeight: number, upperLimit: number, lowerLimit: number) {

    this.buildPrimaryYaxis(values, upperLimit, lowerLimit);

    if (values.chartType == 'line') {
      if (values.close) {
        this.addData("Schlusskurs", groupedData.closeData);
      }

      if (values.open) {
        this.addData("Eröffnung", groupedData.openData);
      }

      if (values.high) {
        this.addData("HOCH", groupedData.highData);
      }

      if (values.low) {
        this.addData("TIEF", groupedData.lowData);
      }
    }

    if (values.mav38) {
      this.addData("MAV 38", groupedData.mav38Data, "line");
    }

    if (values.mav200) {
      this.addData("MAV 200", groupedData.mav200Data, "line");
    }

    if (values.trades) {
      this.addBottomData("Anz. Handel", groupedData.tradesData, "line");
      this.initBottomAxis(chartHeight);
    }

    if (values.cumqty) {
      this.addBottomData("Ges. Vol", groupedData.cumqtyData, "column");
      this.initBottomAxis(chartHeight);
    }

    if (values.chartType == 'candle') {
      let subseries = {
        name: 'Candle Stick',
        data: groupedData.candleData,
        type: 'candlestick',
        dataGrouping: {
          units: [
            ['week', // unit name
              [1] // allowed multiples
            ], [
              'month',
              [1, 2, 3, 4, 6]]
          ]
        }
      };
      this.series.push(subseries);
    }

    if (values.chartType == 'ohlc') {
      let subseries = {
        name: 'OHLC',
        data: groupedData.candleData,
        type: 'ohlc',
        dataGrouping: {
          units: [
            ['week', // unit name
              [1] // allowed multiples
            ], [
              'month',
              [1, 2, 3, 4, 6]]
          ]
        }
      };
      this.series.push(subseries);
    }

    let options = {
      rangeSelector: {
        inputBoxStyle:
        {
          right: '20px'
        },
        selected: 2
      },
      credits: { enabled: false },
      series: this.series,
      yAxis: this.yaxis,

      plotOptions: {
        series: {
          animation: false
        }
      }
    };

    return options;
  }

  private addBottomData(name, data, type) {
    let subseries = {
      name: name,
      data: data,
      yAxis: 1,
      type: type,
      tooltip: {
        valueDecimals: 0
      }
    };
    this.series.push(subseries);
  }

  private initBottomAxis(chartHeight) {
    let wasInited = this.yaxis.length > 1;

    if (!wasInited) {
      this.primaryYaxis.height = (chartHeight - 210);
      let subYaxis = {
        title: {
          text: 'Stück'
        },
        offset: 20,
        top: (chartHeight - 155),
        height: 60,
        lineWidth: 2
      };
      this.yaxis.push(subYaxis);
    }
  }

}

export class GroupedData {
  closeData = [];
  openData = [];
  highData = [];
  lowData = [];
  mav38Data = [];
  mav200Data = [];
  cumqtyData = [];
  tradesData = [];
  candleData = [];

  public clean() {
    this.closeData = [];
    this.openData = [];
    this.highData = [];
    this.lowData = [];
    this.mav38Data = [];
    this.mav200Data = [];
    this.cumqtyData = [];
    this.tradesData = [];
    this.candleData = [];
  }
}

export interface HistoryChartData {
  open: number;
  high: number;
  low: number;
  close: number;
  mav38: number;
  mav200: number;
  cumulatedQuantity: number;
  tradesCount: number;
  tradingUtc: number;
  tradingDate: moment.Moment;
}


export interface HistoryChartResponse {
  open: string;
  high: string;
  low: string;
  close: string;
  mav38: string;
  mav200: string;
  cumulatedQuantity: string;
  tradesCount: string;
  tradingUtc: number;
  tradingDate: string;
}


