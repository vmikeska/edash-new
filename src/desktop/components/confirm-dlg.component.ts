
import { Component, OnInit } from '@angular/core';
import { DlgContentBase } from './dlg-content-base';


@Component({
    selector: 'confirm-dlg',
    templateUrl: 'confirm-dlg.html'
})

export class ConfirmDlgComponent 
extends DlgContentBase 
implements OnInit {

    ngOnInit() {

    }

    constructor() {
        super();
    }

    public text = "";

}