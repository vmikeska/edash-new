import { Component, Input, OnInit, ViewChild } from "@angular/core";

import * as moment from 'moment';
import * as _ from "lodash";
import { Subject } from "rxjs/Subject";
import { OrdersDataService, OrderResponse } from "./orders-data.service";
import { MdlgCreationService } from "../../../desktop/services/mdlg-creation.service";
import { DataTableComponent, ServiceMenuAction, DataTableRow, ActionClickEvent, DataTableHeaderItem, DataColumnType } from "../../../desktop/controls/data-table.component";
import { WinContentBase } from "../../../desktop/components/win-content-base";
import { Utils } from "../../../common/Utils";
import { OrdersCommon } from "./OrdersCommon";
import { PermissionService } from "../../services/permission.service";



@Component({
    selector: 'orders-inactive-table',
    templateUrl: './orders-inactive-table.html',
})

export class OrdersInactiveTableComponent implements OnInit {
    ngOnInit() {
        this.refreshData();
        this.sortByExecuted();
    }

    constructor(
        private _orderDataSvc: OrdersDataService,
        private _permissionSvc: PermissionService,
        private _modalDlgSvc: MdlgCreationService,
    ) {

    }

    @ViewChild('table')
    public table: DataTableComponent;

    @Input()
    public parent: WinContentBase;

    public customActions: ServiceMenuAction[] = [
        {
            action: "Delete",
            icon: "icon-trash",
            text: "delete",
            setVisibility: (row: DataTableRow) => {
                let extern = row.origRow.getVal("otc");
                return extern;
            }
        }
    ];

    private sortByExecuted() {
        this.table.orderByColumn(false, "executed");
    }

    public async orderActionClick(e: ActionClickEvent) {

        if (e.action === "Delete") {
            if (this._permissionSvc.hasPermission("ORDERS", "write")) {

                this._modalDlgSvc.showConfirmDialog("Order deletion", "Would you like to delete the order?", "Delete", async () => {
                    var orderId = e.row.origRow.getVal("id");

                    await this._orderDataSvc.deleteOtcOrderAsync(orderId);
                    await this.refreshData();
                    this.sortByExecuted();
                });

                //todo: play sound
                // if (playsound) {
                //     if (ed.sound.enabled) {
                //         ion.sound.play("bell", { volume: ed.sound.volume });
                //     }
                // }

            }
        }
    }

    public observableData = new Subject<object[]>();

    private orders: InactiveOrderVM[];

    private rebindTable() {
        this.observableData.next(this.orders);
    }


    private async refreshData() {
        let ordersRes = await this._orderDataSvc.getData(false);

        let ordersVM = this.mapResponses(ordersRes);

        this.orders = ordersVM;

        this.rebindTable();
    }

    private externColDrawing(value, disVal) {

        let txt = value ? "Yes" : "No";
        let cls = value ? "blue" : "";

        return `<span class="extern-cell ${cls}">${txt}</span>`;
    }

    public headers: DataTableHeaderItem[] = [

        { name: "id", col: "id", visible: false, },
        { name: "Typ", col: "orderType", visible: false },
        { name: "Limit", col: "orderLimit", visible: false },
        { name: "Instrument", col: "instrType", visible: false },
        { name: "Name", col: "longName", visible: false },
        { name: "Erstellt", col: "created", visible: false },
        { name: "Order Vol", col: "orderQuantity", visible: false },

        { name: "Seite", col: "buySide", visible: true, customCellDrawing: OrdersCommon.customBuysideCellDrawing },
        { name: "Handelsp.", col: "exchName", visible: true, },
        { name: "VHP", col: "segment", visible: true },
        { name: "Produkt", col: "symbol", visible: true },
        { name: "Status", col: "orderState", visible: true },
        { name: "Ausf. Vol", col: "execQuantity", visible: true, type: DataColumnType.TypeFloat, typeArgs: ".3", cellClass: "h-right" },
        { name: "Ausf. Preis", col: "execPrice", visible: true, type: DataColumnType.TypeFloat, typeArgs: ".3" },
        { name: "Ausgef.", col: "executed", visible: true, type: DataColumnType.TypeDateMoment, typeArgs: "HH:mm l" },
        { name: "Extern", col: "otc", visible: true, customCellDrawing: this.externColDrawing },

    ];

    private mapResponses(rs: OrderResponse[]) {
        let res = _.map(rs, (r) => { return this.mapResponse(r) });
        return res;
    }

    private mapResponse(i: OrderResponse) {
        let executed = Utils.any(i.executions) ? moment(i.executions[0].created) : null;
        let created = moment(i.created);

        let quantity = Utils.any(i.executions) ? i.executions[0].quantity : null;
        let price = Utils.any(i.executions) ? i.executions[0].price : null;

        let o: InactiveOrderVM = {
            exchName: i.exchange.name,

            instrType: i.instrument.market,
            symbol: i.instrument.symbol,
            longName: i.instrument.name,
            execQuantity: quantity,
            execPrice: price,
            executed: executed,

            segment: i.instrument.vtp,

            id: i.id,
            orderState: i.orderState,
            orderType: i.orderType,
            buySide: i.buySide,
            orderQuantity: i.orderQuantity,
            orderLimit: i.orderLimit,
            created: created,
            otc: i.otc,

            //todo: meaning of this cols?
            // isin: i.isin,
            // wkn: i.wkn,
            // energyType: i.instrument.groups.maingroup,

        };

        return o;
    }
}

export interface InactiveOrderVM {
    exchName;
    instrType;
    symbol;
    longName;
    execQuantity;
    execPrice;
    executed;

    id: number;
    orderState;
    orderType;
    buySide: boolean;
    orderQuantity: number;
    orderLimit: number;
    created: moment.Moment;
    otc: boolean;

    segment;



}