

import { Component, ViewChild } from '@angular/core';
import { WinContentBase } from '../../../desktop/components/win-content-base';
import { LcMgmtDataService, LoadcurveResponse } from './lc-mgmt-data.service';
import { ActionClickEvent, ServiceMenuAction, DataTableHeaderItem, DataColumnType, DataTableComponent } from '../../../desktop/controls/data-table.component';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
import { MdlgCreationService } from '../../../desktop/services/mdlg-creation.service';
import { NotificationService, MessagesImportance } from '../../services/notification.service';
import { LcWizardComponent } from './lc-wizard-dlg.component';
import { LcEditDlgComponent } from './lc-edit-dlg.component';
import { LcDownloadDlgComponent } from './lc-download-dlg.component';

@Component({
    selector: 'lc-management',
    templateUrl: 'lc-management.html'
})

export class LcManagementComponent extends WinContentBase {
    constructor(
        private _lcMgmtDataSvc: LcMgmtDataService,
        private _mdlgSvc: MdlgCreationService,
        private _notifSvc: NotificationService
    ) {
        super();
    }

    public observableData = new Subject<any[]>();

    @ViewChild("table")
    public table: DataTableComponent;

    protected async onInit() {
        this.refreshAsync();
    }

    private async refreshAsync() {
        let items = await this._lcMgmtDataSvc.getListAsync();
        let vms = this.mapItems(items);
        this.observableData.next(vms);
    }

    public addNewClicked() {
        this.createWizard();
    }

    private createWizard() {
        let insts = this._mdlgSvc.createInst<LcWizardComponent>(LcWizardComponent,
            (content) => {
                content.onFinished.subscribe(() => {
                    this.refreshAsync();
                })
            },
            (dialog) => {
                dialog.title = "Neuer Lastgang";
                dialog.buttonsManager.addCloseButton();
            }
        );
    }

    public headers: DataTableHeaderItem[] = [
        { col: "name", name: "Bezeichnung", visible: true, hideSortButton: true },
        { col: "vtp", name: "VHP", visible: true, hideSortButton: true },
        { col: "clusterName", name: "Kundengruppe", visible: true, hideSortButton: true },
        { col: "clusterId", name: "ClusterId", visible: true, hideSortButton: true },
        { col: "amount", name: "Ges. Menge", visible: true, type: DataColumnType.TypeFloat, typeArgs: ".3" },
        { col: "utilHoursDuration", name: "BNST", visible: true, type: DataColumnType.TypeFloat, typeArgs: ".3" },
        { col: "min", name: "minAmount", visible: true, type: DataColumnType.TypeFloat, typeArgs: ".3" },
        { col: "max", name: "maxAmount", visible: true, type: DataColumnType.TypeFloat, typeArgs: ".3" },
        { col: "avg", name: "avgAmount", visible: true, type: DataColumnType.TypeFloat, typeArgs: ".3" },
    ];

    public customActions: ServiceMenuAction[] = [
        {
            action: "download",
            icon: "icon-download",
            text: "download loadcurve"
        },
        {
            action: "edit",
            icon: "icon-pencil",
            text: "edit loadcurve"
        },
        {
            action: "delete",
            icon: "icon-trash",
            text: "delete loadcurve"
        },

    ];

    public onTableDataLoaded() {
        this.table.orderByColumn(true, "name");
    }

    public itemActionClick(e: ActionClickEvent) {

        let item = e.row.origRow.toJsonTyped<LoadcurveVM>();

        if (e.action === "delete") {
            this._mdlgSvc.showConfirmDialog("Loadcurve deletion", "Do you want to delete this loadcurve?", "Delete", async () => {
                this._lcMgmtDataSvc.deleteAsync(item.id).then(() => {
                    this._notifSvc.addMessage("Lastgang löschen", "Lastgang wurde erfolgreich gelöscht!", MessagesImportance.Finished);
                    this.refreshAsync();
                })

            })
        }

        if (e.action === "edit") {
            let item = e.row.origRow.toJsonTyped<LoadcurveVM>();
            this.createEditWindow(item.id);
        }

        if (e.action === "download") {
            let item = e.row.origRow.toJsonTyped<LoadcurveVM>();
            this.createDownloadWin(item.id, item.name);
        }
    }


    private createEditWindow(id: number) {
        let insts = this._mdlgSvc.createInst<LcEditDlgComponent>(LcEditDlgComponent,
            (content) => {
                content.editedId = id;

                content.onFinsihed.subscribe(() => {
                    this.refreshAsync();
                })
            },
            (dialog) => {
                dialog.title = "Lastgang ändern";
            }
        )
    }

    private createDownloadWin(id: number, name: string) {
        let insts = this._mdlgSvc.createInst<LcDownloadDlgComponent>(LcDownloadDlgComponent,
            (content) => {
                content.downloadedId = id;
                content.lName = name;

            },
            (dialog) => {
                dialog.title = "Lastgang download";
            }
        )
    }

    private mapItems(responses: LoadcurveResponse[]) {

        let items = _.map(responses, (r) => {
            let i: LoadcurveVM = {
                id: r.id,
                clusterName: r.cluster.name,
                clusterId: r.cluster.id,
                amount: r.amount,
                avg: r.avgAmount,
                max: r.maxAmount,
                min: r.minAmount,
                name: r.name,
                utilHoursDuration: r.utilHoursDuration,
                vtp: r.vtp
            };

            return i;
        });

        return items;
    }
}

export class LoadcurveVM {
    id: number;
    name: string;
    vtp: string;
    clusterName: string;
    clusterId: number;
    amount: number;
    utilHoursDuration: number;
    min: number;
    max: number;
    avg: number;
}