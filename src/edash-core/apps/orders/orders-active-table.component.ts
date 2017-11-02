import { Component, Input } from "@angular/core";

import * as moment from 'moment';
import * as _ from "lodash";
import { Subject } from "rxjs/Subject";
import { OrdersSubscriptionService } from "./orders-subscription.service";
import { OrdersDataService } from "./orders-data.service";
import { ServiceMenuAction, DataTableRow, DataTableHeaderItem, DataColumnType, ActionClickEvent } from "../../../desktop/controls/data-table.component";

import { OrdersCommon } from "./OrdersCommon";
import { WinContentBase } from "../../../desktop/components/win-content-base";

import { ISubscriptionObj } from "../quote-page/quote-page-subscription.service";
import { OrderEditDlgComponent } from "./order-edit.component";
import { MessagesImportance, NotificationService } from "../../services/notification.service";
import { PermissionService } from "../../services/permission.service";
import { MdlgCreationService } from "../../../desktop/services/mdlg-creation.service";
import { Utils } from "../../../common/Utils";
import { DelayedReturn } from "../../../common/DelayedReturn";


@Component({
    selector: 'orders-active-table',
    templateUrl: './orders-active-table.html',
})

export class OrdersActiveTableComponent {

    constructor(
        private _notifSvc: NotificationService,
        private _modalDlgSvc: MdlgCreationService,
        private _ordersSubscriptionSvc: OrdersSubscriptionService,
        private _permissionSvc: PermissionService,
        private _orderDataSvc: OrdersDataService) {

        this.createSubscription();

        this.initDelayedDataBinding();
    }

    private orders: ActiveOrderVM[] = [];
    public observableData = new Subject<object[]>();
    private delayedDataBinding: DelayedReturn;

    public customActions: ServiceMenuAction[] = [
        {
            action: "Accept",
            icon: "icon-thumbs-o-up",
            text: "akzeptieren",
            setVisibility: (row: DataTableRow) => {
                let state = row.origRow.getVal("o_state");
                return state === "counteroffer";
            }
        },
        {
            action: "Edit",
            icon: "icon-pencil",
            text: "edit",
            setVisibility: (row: DataTableRow) => {
                let type = row.origRow.getVal("i_type");
                let state = row.origRow.getVal("o_state");
                
                let editable = (type === "lc") && (state !== "counteroffer");
                return editable;
                //return true;
            }
        },
        {
            action: "Delete",
            icon: "icon-trash",
            text: "delete"
        }
    ];

    public headers: DataTableHeaderItem[] = [
        { col: "o_id", name: "id", visible: false },
        { col: "o_remarks", name: "Remarks", visible: false },
        { col: "o_state", name: "Status", visible: false },

        { col: "o_buyside", name: "Seite", visible: true, customCellDrawing: OrdersCommon.customBuysideCellDrawing },
        { col: "e_name", name: "Handelsp.", visible: true },
        { col: "i_vtp", name: "VHP", visible: true },
        { col: "i_symbol", name: "Produkt", visible: true },
        { col: "o_type", name: "Typ", visible: true },
        { col: "o_qty", name: "Order Vol", visible: true, type: DataColumnType.TypeFloat, typeArgs: ".3" },
        { col: "o_price", name: "Limit", visible: true, type: DataColumnType.TypeFloat, typeArgs: ".3" },
        { col: "o_expires", name: "Gültigkeit", visible: true, type: DataColumnType.TypeDateMoment, typeArgs: "HH:mm l" },
        { col: "o_created", name: "Erstellt", visible: true, type: DataColumnType.TypeDateMoment, typeArgs: "HH:mm l" },
    ];

    @Input()
    public parent: WinContentBase;

    private customExternCellDrawing(value, disVal) {

        let buy = Utils.parseBool(value);

        let txt = buy ? "Kauf" : "VKauf";
        let cls = buy ? "order-buy" : "order-sell";
        return `<span class="order-cell ${cls}">${txt}</span>`
    }

    private createSubscription() {
        this._ordersSubscriptionSvc.subscribe();
        this._ordersSubscriptionSvc.onItemUpdate.subscribe((dataObj) => {
            this.processUpdate(dataObj);
        })
    }

    private initDelayedDataBinding() {
        this.delayedDataBinding = new DelayedReturn(200);
        this.delayedDataBinding.callback = () => {
            this.sortByCreated();
            this.rebindTable();
        }
    }

    private rebindTable() {
        this.observableData.next(this.orders);
    }

    private sortByCreated() {
        this.orders = _.sortBy(this.orders, ["o_created"]).reverse();
    }

    public processUpdate(updateObj: ISubscriptionObj) {
        var data = {};

        let command = updateObj.getValue("command");

        switch (command) {
            case 'ADD':
                this.addNewRow(updateObj);
                break;
            case 'UPDATE':
                this.updateRow(updateObj);
                break;
            case 'DELETE':
                this.deleteRow(updateObj);
                break;
        }

        this.delayedDataBinding.call();
    }

    private getExpires(val) {
        if (val) {
            return moment(val, 'YYYY-MM-DD HH:mm:ss');
        }

        return null;
    }

    public orderActionClick(e: ActionClickEvent) {

        if (this._permissionSvc.hasPermission("ORDERS", "write")) {

            let orderId = e.row.origRow.getVal("o_id");

            if (e.action === "Delete") {
                this._modalDlgSvc.showConfirmDialog("Order deletion", "Would you like to delete the order?", "Delete", () => {
                    this._orderDataSvc.deleteOrderAsync(orderId);
                });
            }

            if (e.action === "Accept") {
                let state = e.row.origRow.getVal("o_state");
                this._orderDataSvc.acceptOrderAsync(orderId, state);
            }

            if (e.action == "Edit") {
                this.createOrderEditDlg(orderId);
            }
        }
    }

    public createOrderEditDlg(orderId) {

        let order = this.getOrderById(orderId);

        this._modalDlgSvc.createInst<OrderEditDlgComponent>(OrderEditDlgComponent,
            (m) => {
                m.data = order
            },
            (m) => {
                m.title = "Order ändern";

                m.buttonsManager.addCloseButton();
            }
        );
    }

    private getOrderById(orderId) {
        let order = _.find(this.orders, { o_id: orderId });
        return order;
    }

    private createUpdateNotification(counterOffer, changedFields) {
        if (counterOffer) {
            this._notifSvc.addMessage("Notification", "Gegenangebot für Lastgang", MessagesImportance.Info);
        }
        else {
            var message = '';
            for (var i = 0; i < changedFields.length; i++) {
                if (i == 0) {
                    message = changedFields[i];
                }
                else {
                    message = message + ', ' + changedFields[i];
                }
            }

            this._notifSvc.addMessage("Notification", `Order geändert: ${message}`, MessagesImportance.Info);
        }
    }

    private deleleOrderById(orderId) {        
        this.orders = _.reject(this.orders, { o_id: orderId }); 
        this.rebindTable();       
    }

    private updateRow(dataObj: ISubscriptionObj) {
        let orderId = parseInt(dataObj.getValue("o_id"));
        let order = this.getOrderById(orderId);

        let counteroffer = false;
        let changedFields = [];

        dataObj.forEachChangedField(function (fieldName, fieldPos, value) {
            switch (fieldName) {
                case 'o_price':
                    order.o_price = parseFloat(value);
                    changedFields.push("Limitpreis");
                    break;
                case 'o_qty':
                    order.o_qty = parseFloat(value);
                    changedFields.push("Qty");
                    break;
                case 'o_value':
                    order.o_value = parseFloat(value);
                    changedFields.push("Orderwert");
                    break;
                case 'o_remarks':
                    order.o_remarks = value;
                    break;
                case 'o_expires':
                    order.o_expires = this.getExpires(value);
                    break;
                case 'o_state':
                    order.o_state = value;
                    if (order.o_state === 'counteroffer') {
                        counteroffer = true;
                    }
                    break;
            }
        });

        this.createUpdateNotification(counteroffer, changedFields);
    }

    private addNewRow(dataObj: ISubscriptionObj) {

        let created = moment(dataObj.getValue("o_created"), 'YYYY-MM-DD HH:mm:ss');

        let data: ActiveOrderVM = {
            command: dataObj.getValue("command"),
            o_id: parseInt(dataObj.getValue("o_id")),
            o_buyside: dataObj.getValue("o_buyside"),
            o_qty: parseFloat(dataObj.getValue("o_qty")),
            i_symbol: dataObj.getValue("i_symbol"),
            o_value: parseFloat(dataObj.getValue("o_value")),
            o_created: created,
            o_expires: this.getExpires(dataObj.getValue("o_expires")),
            c_name: dataObj.getValue("c_name"),
            o_price: parseFloat(dataObj.getValue("o_price")),
            o_state: dataObj.getValue("o_state"),
            i_type: dataObj.getValue("i_type"),
            e_name: dataObj.getValue("e_name"),
            o_type: dataObj.getValue("o_type"),
            o_remarks: dataObj.getValue("o_type"),
            i_vtp: dataObj.getValue("i_vtp")
        };

        this.orders.push(data);

        this._notifSvc.addMessage("New order", "Order pending.", MessagesImportance.Info);
    }

    private deleteRow(dataObj: ISubscriptionObj) {
        let oid = parseInt(dataObj.getValue("o_id"));
        this.deleleOrderById(oid);

        let state = dataObj.getValue("o_state");

        if (state === 'executed') {
            this._notifSvc.addMessage("Order execution", "Order was executed.", MessagesImportance.Finished);
        }
        else if (state === 'rejected') {
            this._notifSvc.addMessage("Order execution", "Order was rejected.", MessagesImportance.Error);
        }
        else {
            this._notifSvc.addMessage("Order deletion", "Order was deleted.", MessagesImportance.Info);
        }
    }
}

export interface ActiveOrderVM {
    command: string;
    o_id: number;
    o_buyside: string;
    o_qty: number;
    i_symbol: string;
    o_value: number;
    o_created?: moment.Moment;
    o_expires?: moment.Moment;
    c_name: string;
    o_price: number;
    o_state: string;
    i_type: string;
    e_name: string;
    o_type: string;
    i_vtp: string;

    o_remarks;
}