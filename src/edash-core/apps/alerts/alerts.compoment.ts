import { Component, OnInit } from '@angular/core';
import { WinContentBase } from '../../../desktop/components/win-content-base';
import { DataColumnType, DataTableHeaderItem, ActionClickEvent, ServiceMenuAction, CheckboxChanedEvent } from '../../../desktop/controls/data-table.component';
import { Subject } from 'rxjs/Subject';
import { AlertsDataService, AlertResponse, AlertUpdateRequest } from '../../services/alerts-data.service';

import * as moment from "moment";
import * as _ from 'lodash';
import { MdlgCreationService } from '../../../desktop/services/mdlg-creation.service';
import { AlertDetailDialogComponent } from './alert-detail-dialog.component';
import { Utils } from '../../../common/Utils';
import { AlertSubscriptionService } from '../../services/alert-subscription.service';
import { AlertPopupComponent } from './alert-popup.component';

@Component({
    selector: 'alerts',
    templateUrl: 'alerts.html'
})

export class AlertsComponent extends WinContentBase {
    constructor(
        private _alertsDataSvc: AlertsDataService, 
        private _mdlgSvc: MdlgCreationService,
        private  _alertsSubscriptionSvc: AlertSubscriptionService
    ) 
    {
        super();
    }

    protected async onInit() {
        this.rebindTableAsync();
    }

    public observableData = new Subject<object[]>();

    public headers: DataTableHeaderItem[] = [

        { col: "active", name: "Status", visible: true, customCellDrawing: this.activeCellCustomDraw },
        { col: "symbol", name: "Produkt", visible: true, },
        { col: "exchangeName", name: "Handelsp.", visible: true, },
        { col: "vtp", name: "VHP", visible: true, },
        { col: "lowerPrice", name: "Unteres Limit", visible: true, type: DataColumnType.TypeFloat, typeArgs: ".2" },
        { col: "upperPrice", name: "Oberes Limit", visible: true, type: DataColumnType.TypeFloat, typeArgs: ".2" },
        { col: "actSms", name: "SMS", visible: true, type: DataColumnType.TypeCheckbox },
        { col: "actEmail", name: "E-Mail", visible: true, type: DataColumnType.TypeCheckbox },
        { col: "actClient", name: "Signal", visible: true, type: DataColumnType.TypeCheckbox },
        { col: "remarks", name: "Bemerkung", visible: true, },

    ];

    public customActions: ServiceMenuAction[] = [
        {
            action: "edit",
            icon: "icon-pencil",
            text: "edit alert"
        },
        {
            action: "delete",
            icon: "icon-trash",
            text: "delete alert"
        },
        {
            action: "test",
            icon: "icon-list",
            text: "test"
        }
    ];
    
    private activeCellCustomDraw(value, disVal) {

        let active = Utils.parseBool(value);
        let iconCls = active ? "ico-active icon-check" : "ico-inactive icon-times";
        
        return `<span class="${iconCls}"></span>`
    }

    public async onTableCheckboxChange(e: CheckboxChanedEvent) {

        let od = e.row.origRow.toJsonTyped<AlertResponse>();

        let req: AlertUpdateRequest = {
            callback: false,
            client: od.actClient,
            email: od.actEmail,
            sms: od.actSms,
            lower: parseFloat(od.lowerPrice),
            upper: parseFloat(od.upperPrice),
            remarks: od.remarks
        };

        //todo: update value

        if (e.col === "active") {
            // req.
        }

        if (e.col === "actSms") {
            req.sms = e.checked;
        }

        if (e.col === "actEmail") {
            req.email = e.checked;
        }

        if (e.col === "actClient") {
            req.client = e.checked;
        }

        this._alertsDataSvc.updateAsync(od.id, req);
    }

    public itemActionClick(e: ActionClickEvent) {

        if (e.action === "delete") {
            this._mdlgSvc.showConfirmDialog("Alert deletion", "Would you like to delete this alert?", "Delete", async () => {
                let item = e.row.origRow.toJsonTyped<AlertVM>();
                await this._alertsDataSvc.deleteAsync(item.id);
                this.rebindTableAsync();
            });
        }

        if (e.action === "edit") {
            let data = e.row.origRow.toJsonTyped<AlertVM>();
            this.openDetailDialog(data.id);
        }

        if (e.action === "test") {
            let data = e.row.origRow.toJsonTyped<AlertVM>();
            
            let insts = this._mdlgSvc.createInst<AlertPopupComponent>(AlertPopupComponent, 
                (content) => {}, 
                (dialog) => {
                    dialog.title = "test";
                });


            insts.contentInstance.initAsync(data.id, true);            
        }
    }

    public addNewAlertClicked() {
        this.openDetailDialog();
    }

    private openDetailDialog(id: number = null) {

        let isEditing = !Utils.isNullOrUndefined(id);

        let title = isEditing ? "Editing alert" : "Create new alert";

        this._mdlgSvc.createInst<AlertDetailDialogComponent>(AlertDetailDialogComponent,
            (content) => {
                content.onListChange.subscribe(() => {
                    this.rebindTableAsync();
                })

                if (id) {
                    content.editedId = id;
                }
            },
            (dialog) => {
                dialog.title = title;


            }
        );

    }

    private async rebindTableAsync() {
        let res = await this._alertsDataSvc.getListAsync();
        let items = AlertsMapping.mapItems(res);
        this.observableData.next(items);
    }

}

class AlertsMapping {

    public static mapItems(responses: AlertResponse[]) {
        let items = _.map(responses, (item) => {
            return this.mapItem(item);
        });

        return items;
    }

    public static mapItem(r: AlertResponse) {

        let created = moment(r.created, "YYYY-MM-DD hh:mm:ss");

        let item: AlertVM = {
            id: r.id,
            instrumentId: r.instrument.id,
            exchangeId: r.exchange.id,
            symbol: r.instrument.symbol,
            exchangeName: r.exchange.name,
            vtp: r.instrument.vtp,
            upperPrice: parseFloat(r.upperPrice),
            lowerPrice: parseFloat(r.lowerPrice),
            actClient: r.actClient,
            actEmail: r.actEmail,
            actSms: r.actSms,
            active: r.active,
            remarks: r.remarks,
            created: created
        };

        return item;
    }

}

interface AlertVM {
    id: number;
    instrumentId: number;
    exchangeId: number;
    symbol: string;
    exchangeName: string;
    vtp: string;
    upperPrice: number;
    lowerPrice: number;
    actClient: boolean;
    actSms: boolean;
    remarks: string;
    actEmail: boolean;
    active: boolean;
    created: moment.Moment;
}