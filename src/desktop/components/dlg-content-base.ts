import { OnInit, OnDestroy } from "@angular/core";
import { FormsManagerLocal, FormsManagerService } from "../forms/FormsManger";
import { ModalDialogComponent } from "./modal-dialog.component";


export class DlgContentBase
    implements OnInit, OnDestroy {

    public formsManager: FormsManagerLocal;

    ngOnInit() {
        this.formsManager = FormsManagerService.create(this);
        this.onInit();
    }

    ngOnDestroy() {
        FormsManagerService.destroy(this);
    }

    protected onInit() {}

    public parentWin: ModalDialogComponent;

    public data: any;

    public get defaultForm() {
        return this.formsManager.defaultForm;
    }
}