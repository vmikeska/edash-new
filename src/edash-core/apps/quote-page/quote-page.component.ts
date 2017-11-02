import { Component, Injector, Input, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import * as _ from "lodash";
import * as moment from 'moment';

import { Subject } from "rxjs/Subject";
import { MdlgCreationService } from '../../../desktop/services/mdlg-creation.service';
import { InstrumentSelectionComponent, InstrumentEvent } from '../instrument-selection/instrument-selection.component';
import { QuotePageSubscriptionService, SubscriptionSvcInstance, InsturmentUpdateEvent } from './quote-page-subscription.service';
import { WinContentBase } from '../../../desktop/components/win-content-base';
import { TradableInstrumentsService } from '../../services/tradable-instruments.service';
import { DataTableHeaderItem, DataColumnType, DataTableComponent, ServiceMenuAction, ActionClickEvent, CellClickEvent } from '../../../desktop/controls/data-table.component';
import { TabItem } from '../../../desktop/controls/tabs.component';
import { OrdersService } from '../../services/orders.service';
import { PermissionService } from '../../services/permission.service';
import { SellFormComponent } from './sell-form.component';
import { FlashTest } from './FlashTest';
import { ValueHistorization } from './ValueHistorization';
import { InstrumentVM } from './InstrumentVM';
import { SyncedSorting } from './SyncedSorting';
import { HistoryChartFactoryService } from '../history-chart/history-chart-factory.service';
import { RealTimeChartFactoryService } from '../realtime-chart/real-time-chart-factory.service';
import { DelayedReturn } from '../../../common/DelayedReturn'

@Component({
  selector: 'quote-page',
  templateUrl: './quote-page.html',
})

export class QuotePageComponent extends WinContentBase {

  constructor(

    private _ordersSvc: OrdersService,
    private _tradableSvc: TradableInstrumentsService,
    private _permSvc: PermissionService,
    private _mdlgSvc: MdlgCreationService,
    public _subscribtionSvc: QuotePageSubscriptionService,
    private _zone: NgZone,
    private _histChartFactorySvc: HistoryChartFactoryService,
    private _realChartFactorySvc: RealTimeChartFactoryService

  ) {

    super();
  }

  public onInit() {
    this.createSubscription();
    this.initAfterAddCallback();
    this.syncedSorting = new SyncedSorting(this.table, this._zone);
  }

  private subSvcInst: SubscriptionSvcInstance = null;

  public get subSvcInstance() {
    if (!this.subSvcInst) {
      this.subSvcInst = this._subscribtionSvc.getOrCreateInstance(this.parentWin.id);
    }

    return this.subSvcInst;
  }

  public headers: DataTableHeaderItem[] = [

    { col: "alias", name: "Alias", visible: true, hidden: true },

    { col: "symbol", name: "Produkt", visible: true, cellClass: "bold pointer noselect", hideSortButton: true, headerClass: "pointer", headerTitle: "Sort by alias" },
    { col: "exchName", name: "Handelsp.", visible: true },
    { col: "segmentKey", name: "VHP", visible: true },
    { col: "bid_qty", name: "VKauf MW", visible: true, cellClass: "bold", headerClass: "bold", type: DataColumnType.TypeInt },
    { col: "bid_price", name: "VKauf", visible: true, type: DataColumnType.TypeFloat, cellClass: "bold pointer noselect", headerClass: "bold", typeArgs: ".3" },
    { col: "ask_price", name: "Kauf", visible: true, type: DataColumnType.TypeFloat, cellClass: "bold pointer noselect", headerClass: "bold", typeArgs: ".3" },
    { col: "ask_qty", name: "Kauf MW", visible: true, type: DataColumnType.TypeInt, headerClass: "bold", cellClass: "bold" },
    { col: "last_price", name: "Letzter", visible: true, type: DataColumnType.TypeFloat, typeArgs: ".3" },
    { col: "last_qty", name: "Letz. MW", visible: false, type: DataColumnType.TypeInt },
    { col: "last_time", name: "Zeitstempel", visible: true, type: DataColumnType.TypeDateMoment, typeArgs: "LTS l" },
    { col: "open", name: "Open", visible: false, type: DataColumnType.TypeFloat, typeArgs: ".3" },
    { col: "high", name: "High", visible: false, type: DataColumnType.TypeFloat, typeArgs: ".3" },
    { col: "low", name: "Low", visible: false, type: DataColumnType.TypeFloat, typeArgs: ".3" },
    { col: "cumqty", name: "Kum Menge", visible: false, type: DataColumnType.TypeInt },
    { col: "trades", name: "Handel", visible: false, type: DataColumnType.TypeInt },
  ];


  @ViewChild('table')
  public table: DataTableComponent;

  @ViewChild('instrumentsSelector')
  public instrumentsSelector: InstrumentSelectionComponent;

  @ViewChild('midCont')
  private midCont: ElementRef;

  public buildedInstruments: InstrumentVM[] = [];

  public observableData = new Subject<object[]>();

  private afterAddDelayedCallback: DelayedReturn;

  public tabs: TabItem[] = [
    { id: "hsFilterNew", name: "Filter/New" },
    { id: "hsConfig", name: "Gesp. Konfiguartion" },
    { id: "hsUnits", name: "Einheiten" },
    { id: "hsTest", name: "Test" },
  ];

  public syncedSorting: SyncedSorting;

  public onTableHeaderClicked(header: DataTableHeaderItem) {
    if (header.col === "symbol") {
      this.table.orderByColumn(true, "alias");
    }
  }

  public instrumentSelectionChange(e: InstrumentEvent) {
    if (e.added) {
      this.subSvcInstance.subscribeOne(e.key);
    } else {
      this.subSvcInstance.unsubscribeOne(e.key);
      this.removeBuildedInstrument(e.key);
    }
  }

  private createSubscription() {
    this.subSvcInstance.onItemUpdate.subscribe((e: InsturmentUpdateEvent) => {

      let isSnapshot = e.data.isSnapshot();
      if (isSnapshot) {
        let instrument = this.buildInstrument(e.data);
        this.addOrUpdateBuildedInstrument(instrument);

        this.syncedSorting.receive(instrument.instrKey);
      }
      else {
        this.updateInstrumentData(e.data);
      }

    })
  }

  public customActions: ServiceMenuAction[] = [
    {
      action: "RtChart",
      icon: "icon-chart-area",
      text: "Realtime chart"
    },
    {
      action: "HistoryChart",
      icon: "icon-clock-o",
      text: "history chart"
    },
    {
      action: "Alert",
      icon: "icon-bell",
      text: "Alerts"
    }
  ];

  public instrumentActionClick(e: ActionClickEvent) {

    let exchangeId = e.row.origRow.getVal("exchangeId");
    let instrumentId = e.row.origRow.getVal("instrId");

    let params = {
      exchangeId: exchangeId,
      instrumentId: instrumentId
    };

    if (e.action === "RtChart") {
      this._realChartFactorySvc.instance(params);
    }

    if (e.action === "HistoryChart") {
      this._histChartFactorySvc.instance(params);
    }
  }

  private buildInstrument(dataObject) {
    let instrKey = dataObject.getItemName();

    let keyParams = instrKey.split(';');
    let exchangeId = parseInt(keyParams[1]);
    let alias = keyParams[2];

    var insData = this._tradableSvc.getInstrumentDataByAlias(exchangeId, alias);

    let segmentKey = this._tradableSvc.buildSegmentName(insData.vtp.name, insData.loadPeriod.name);

    let r: InstrumentVM = {
      instrKey: instrKey,

      alias: alias,
      instrId: insData.instrument.id,
      exchangeId: exchangeId,
      deliveryHours: insData.instrument.instrument.deliveryHours,
      maxAmount: parseFloat(insData.instrument.maxAmount),
      minAmount: parseFloat(insData.instrument.minAmount),
      symbol: insData.instrument.instrument.symbol,
      exchName: insData.exchange.exchange.name,
      segmentKey: segmentKey,
      open: parseFloat(dataObject.getValue("open")),
      high: parseFloat(dataObject.getValue("high")),
      low: parseFloat(dataObject.getValue("low")),
      cumqty: parseFloat(dataObject.getValue("cumqty")),
      trades: parseInt(dataObject.getValue("trades")),
      bid_qty: parseFloat(dataObject.getValue("bid_qty")),
      bid_price: parseFloat(dataObject.getValue("bid_price")),
      ask_qty: parseFloat(dataObject.getValue("ask_qty")),
      ask_price: parseFloat(dataObject.getValue("ask_price")),
      last_price: parseFloat(dataObject.getValue("last_price")),
      last_qty: parseFloat(dataObject.getValue("last_qty")),
      last_time: moment(dataObject.getValue("last_time"), 'YYYY-MM-DD HH:mm:ss')
    };

    return r;
  }

  private initAfterAddCallback() {
    let d = new DelayedReturn(200);
    d.callback = () => {
      this.rebindTable();
    }

    this.afterAddDelayedCallback = d;
  }

  private addOrUpdateBuildedInstrument(instr) {
    let i = _.find(this.buildedInstruments, { instrKey: instr.instrKey });
    if (i) {
      i = instr;
    } else {
      this.buildedInstruments.push(instr);
    }

    this.afterAddDelayedCallback.call();
  }

  private removeBuildedInstrument(instrKey) {
    this.buildedInstruments = _.reject(this.buildedInstruments, (instr) => {
      return instr.instrKey === instrKey;
    });

    this.rebindTable();
  }


  public rebindTable() {
    this.observableData.next(this.buildedInstruments);
  }

  public async tableDoubleClick(e: CellClickEvent) {
    let row = e.row.toJsonTyped<InstrumentVM>()

    var rowinstrdata = row.instrKey.split(';');

    let permission = await this._permSvc.getPermission('RTDATA');

    if (permission === 'write') {
      switch (e.col.col) {
        case 'bid_price':
          if (parseFloat(row.bid_price) > 0 && row.maxAmount > 0) {
            this.openOrderForm(false, 'market', row);
          }
          break;
        case 'ask_price':
          if (parseFloat(row.ask_price) > 0 && row.maxAmount > 0) {
            this.openOrderForm(true, 'market', row);
          }
          break;
        case 'symbol':
          this.removeBuildedInstrument(row.instrKey);
          this.instrumentsSelector.receiveKeyChange(row.instrKey, false);
          break;
      }
    }
  }

  private actionBtnClick(dlg: SellFormComponent) {
    let data = dlg.getRequestData();
    this._ordersSvc.placeOrder(data);
    dlg.parentWin.close();
  }

  private openOrderForm(buying: boolean, type: string, row: InstrumentVM) {

    let instances = this._mdlgSvc.createInst<SellFormComponent>(SellFormComponent,
      (contModel) => {
        contModel.instrument = row;
        contModel.buying = buying;
        contModel.type = type;
        contModel.quantity = buying ? row.ask_qty : row.bid_qty;
        contModel.price = buying ? row.ask_price : row.bid_price;
        contModel.parentId = this.parentWin.id;
      },
      (dlgModel) => {
        dlgModel.title = buying ? "Kauf-Order" : "Verkauf-Order";
      });


    let btnTxt = buying ? "Kaufen" : "Verkaufen";

    instances.dlgInstance.buttonsManager.addEasyButton(btnTxt, () => this.actionBtnClick(instances.contentInstance));
    instances.dlgInstance.buttonsManager.addCloseButton();
  }

  private cellsWithArrows = ["bid_price", "ask_price"];

  private valuesHist = new ValueHistorization();

  private updateBuildedInstrumentCol(instrKey: string, col: string, val: any) {

    let item = _.find(this.buildedInstruments, { instrKey: instrKey });

    if (this.cellsWithArrows.includes(col)) {
      this.valuesHist.addOrUpdateValue(item.instrKey, col, parseFloat(val), item[col]);
    }

    item[col] = val;
  }

  public onTableViewChanged() {
    this.refreshArrows();
  }

  private refreshArrows() {
    this.buildedInstruments.forEach((i) => {
      let rowResult = this.table.getRowByColAndKey("instrKey", i.instrKey);

      this.cellsWithArrows.forEach((c) => {
        let col = rowResult.row.getCol(c);

        let colHistData = this.valuesHist.getValue(i.instrKey, c);

        let arrowStyle = "price-arrow empty icon-arrow-up"; //empty style
        if (colHistData) {
          arrowStyle = colHistData.raised ? "price-arrow up icon-arrow-up" : "price-arrow down icon-arrow-down";
        }

        col.afterTextStyle = arrowStyle;
      });

    })
  }

  private updateInstrumentData(data) {
    let instrKey = data.getItemName();

    //update data physically
    data.forEachChangedField((colName, pos, val) => {
      this.updateBuildedInstrumentCol(instrKey, colName, val);
    });

    this.rebindTable();

    //flash updated cells
    let rowResult = this.table.getRowByColAndKey("instrKey", instrKey);

    data.forEachChangedField((colName, pos, val) => {

      if (rowResult.isVisible) {
        let col = rowResult.row.getCol(colName);
        col.flashCell();
      }
    });
  }

  ///test start

  private timerRef = null;

  public flashTestStart() {
    this.timerRef = setInterval(() => {
      let maxIndex = this.table.pageData.length - 1;
      let randomIndex = this.getRandomInt(0, maxIndex);

      let row = this.table.pageData[randomIndex];

      let key = row.origRow.getCol("instrKey").value;

      let fakeData = new FlashTest(key);

      this.updateInstrumentData(fakeData);

    }, 3000)
  }

  public flashTestEnd() {
    clearInterval(this.timerRef);
  }

  private getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  ///test end

}










