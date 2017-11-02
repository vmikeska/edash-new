import { Injectable, ViewContainerRef, Type } from "@angular/core";
import { DynamicCreationService } from "./dynamic-creation.service";
import { ModalDialogComponent } from "../components/modal-dialog.component";

import { ConfirmDlgComponent } from "../components/confirm-dlg.component";
import { DlgContentBase } from "../components/dlg-content-base";




@Injectable()
export class MdlgCreationService {

    public dlgTarget: ViewContainerRef;

    constructor(private _creationService: DynamicCreationService) {

    }

    public createInstance<T extends DlgContentBase>(t: Type<T>): DlgInstances<T> {

        let dlgComponentRef = this._creationService.createInstance<ModalDialogComponent>(ModalDialogComponent, this.dlgTarget);
        
        dlgComponentRef.instance.component = dlgComponentRef;

        let contentComponentRef = this._creationService.createInstance(t, dlgComponentRef.instance.contPlaceholder);
 
        contentComponentRef.instance.parentWin = dlgComponentRef.instance;

        dlgComponentRef.instance.contentComponent = contentComponentRef;
        
        let r: DlgInstances<T> = {
             dlgInstance: dlgComponentRef.instance,
             contentInstance: <T>contentComponentRef.instance
        };

        return r;
    }

    public createInst<T extends DlgContentBase>(
        t: Type<T>,
        initCompModel: (model: T)=> void = null, 
        initDlgModel: (model: ModalDialogComponent)=> void = null        
        ): DlgInstances<T> {

        let dlgComponentRef = this._creationService.createInst<ModalDialogComponent>(ModalDialogComponent, this.dlgTarget, initDlgModel);
        
        dlgComponentRef.instance.component = dlgComponentRef;

        let contentComponentRef = this._creationService.createInst(t, dlgComponentRef.instance.contPlaceholder, initCompModel);
 
        contentComponentRef.instance.parentWin = dlgComponentRef.instance;

        dlgComponentRef.instance.contentComponent = contentComponentRef;
        
        let r: DlgInstances<T> = {
             dlgInstance: dlgComponentRef.instance,
             contentInstance: <T>contentComponentRef.instance
        };

        return r;
    }

    public showInfoDialog(title: string, text: string) {
        let insts = this.createInstance<ConfirmDlgComponent>(ConfirmDlgComponent);
        
        insts.dlgInstance.title = title;
        insts.contentInstance.text = text;

        insts.dlgInstance.buttonsManager.addCloseButton();
    }
 
    public showConfirmDialog(title: string, text: string, btnText: string, callback: Function = null) {
        let insts = this.createInstance<ConfirmDlgComponent>(ConfirmDlgComponent);
        
        insts.dlgInstance.title = title;
        insts.contentInstance.text = text;

        insts.dlgInstance.buttonsManager.addCloseButton();

        insts.dlgInstance.buttonsManager.addEasyButton(btnText, () => {
            callback();
            insts.dlgInstance.close();
        });

        return insts;
    }

}

export class DlgInstances<T> {
    public dlgInstance: ModalDialogComponent;
    public contentInstance: T;
}
