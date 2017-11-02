
import { Component } from '@angular/core';
import { DlgContentBase } from '../../../desktop/components/dlg-content-base';

@Component({
    selector: 'new-config-dialog',
    templateUrl: 'new-config-dialog.html'
})

export class NewConfigDialogComponent 
extends DlgContentBase 
 {
    public name = "";
}