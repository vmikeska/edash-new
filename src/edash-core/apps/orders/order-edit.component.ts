import { Component, OnInit } from '@angular/core';
import { DlgContentBase } from '../../../desktop/components/dlg-content-base';
import { OrdersDataService, OrderUpdateRequest } from './orders-data.service';
import { ControlsForm, ControlValueChangedEvent } from '../../../desktop/forms/ControlsForm';
import { ActiveOrderVM } from './orders-active-table.component';
import { FormControl } from '../../../desktop/forms/FormControl';
import { DialogButton } from '../../../desktop/components/modal-dialog.component';

@Component({
    selector: 'order-edit',
    templateUrl: 'order-edit.html'
})

export class OrderEditDlgComponent
    extends DlgContentBase
    implements OnInit {
    constructor(private _orderDataSvc: OrdersDataService) {
        super();
    }

    ngOnInit() {
        this.initForm();

        this.goodTillCancelled = !this.model.o_expires;

        this.price = this.model.o_price;
        this.qty = this.model.o_qty;
    }

    public mainForm: ControlsForm;

    public goodTillCancelled = true;
    public price: number;
    public qty: number;

    public get model() {
        return <ActiveOrderVM>this.data;
    }

    private initForm() {
        this.mainForm = new ControlsForm();
        this.mainForm.onValueChanged.subscribe((e) => this.formValueChanged(e));
        this.mainForm.onButtonClicked.subscribe(e => this.buttonClicked(e));

        let btn: DialogButton = {            
            form: this.mainForm,
            tabIndex: 6,
            text: "Speichern",
            visible: true            
        };

        this.parentWin.buttonsManager.addCustomButton(btn);
    }

    private buttonClicked(e: FormControl) {
        if (e.name === "submit") {
            let formVals = this.mainForm.getValuesJson<any>();
            
            let expires = formVals.goodTillCancelled ? "" : `${formVals.date.format("YYYY-MM-DD")} ${formVals.time.hours}:${formVals.time.minutes}`;

            let params: OrderUpdateRequest = {
                quantity: formVals.qty,
                limit: formVals.qty,
                expires: expires
            };
            
            this._orderDataSvc.updateOrderAsync(this.model.o_id, params);
            this.parentWin.close();
        }
    }

    private formValueChanged(e: ControlValueChangedEvent) {
        if (e.control.name === "goodTillCancelled") {
            let gtcChecked = e.control.formValue;

            let timeControl = this.mainForm.getControlByName("time");
            let dateControl = this.mainForm.getControlByName("date");

            timeControl.changeEnabled(!gtcChecked);
            dateControl.changeEnabled(!gtcChecked);
        }
    }

    public get limitEnabled() {
        return this.model.o_type != "market";
    }
}