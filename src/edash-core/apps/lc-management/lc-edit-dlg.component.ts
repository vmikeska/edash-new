import { Component, OnInit, EventEmitter } from '@angular/core';
import { DlgContentBase } from '../../../desktop/components/dlg-content-base';
import { CustomerClusterService, CustomerClusterResponse } from './customer-cluster.service';
import { Subject } from 'rxjs/Subject';
import { LcMgmtDataService, UpdatePartialRequest, LoadcurveResponse } from './lc-mgmt-data.service';
import { NotificationService, MessagesImportance } from '../../services/notification.service';
import { ListItem } from '../../../desktop/forms/ListFormControl';
import * as _ from 'lodash';
import { FormControl } from '@angular/forms';
import { ControlsValidator } from '../../../desktop/forms/control-validator';
import { DialogButton } from '../../../desktop/components/modal-dialog.component';

@Component({
    selector: 'lc-edit-dlg',
    templateUrl: 'lc-edit-dlg.html'
})

export class LcEditDlgComponent extends DlgContentBase {
    constructor(
        private _lcMgmtDataSvc: LcMgmtDataService,
        private _customerClusterSvc: CustomerClusterService,
        private _notifSvc: NotificationService
    ) {
        super();
    }

    protected async onInit() {        
        await this.fillFormAsync();

        this.loadCustomerCluster();

        this.createButtons();

        this.defaultForm.onButtonClicked.subscribe((btn: FormControl) => {            
            
            let valid = this.defaultForm.isValid;
            if (valid) {
                this.save();
            }
        })
    }

    public nameValidator = new ControlsValidator();
    
    private buildNameValidator() {
        this.nameValidator.isNotEmpty = true;
    }

    public origData: LoadcurveResponse;

    public name: string;
    public clusterId: number;

    public onFinsihed = new EventEmitter();

    private createButtons() {
        this.parentWin.buttonsManager.addCloseButton();

        let btn: DialogButton = {            
            form: this.defaultForm,
            tabIndex: 4,
            text: "Save",
            visible: true            
        };

        this.parentWin.buttonsManager.addCustomButton(btn);
    }

    private async fillFormAsync() {
        this.origData = await this._lcMgmtDataSvc.getByIdAsync(this.editedId);        
        this.clusterId = this.origData.cluster.id;
        this.name = this.origData.name;
    }

    public editedId: number;

    public clusterObservable = new Subject<CustomerClusterResponse[]>();

    public async save() {

        let vals = this.defaultForm.getValuesJson<LcEditForm>();

        let clusterId = _.first(vals.cluster).value;

        let req: UpdatePartialRequest = {
            id: this.editedId,
            clusterId: clusterId,
            name: vals.name,
            rollout: vals.roll
        };

        await this._lcMgmtDataSvc.updatePartialBase(req)
            .then((response) => {
                this._notifSvc.addMessage("Edited", "Änderungen des Lastgangs wurden gespeichert", MessagesImportance.Finished);
                this.onFinsihed.emit();
                this.parentWin.close();
            })
            .catch((error) => {
                this._notifSvc.addMessage("Unsuccessful", "Änderungen des Lastgangs konnten nicht gespeichert.", MessagesImportance.Error);
                this._notifSvc.addMessage("Unsuccessful", error.statusText, MessagesImportance.Error);
                this.parentWin.close();
            });
    }


    private async loadCustomerCluster() {
        let items = await this._customerClusterSvc.getAll();
        this.clusterObservable.next(items);
    }


}

export interface LcEditForm {
    name: string;
    cluster: ListItem[];
    roll: boolean;
}