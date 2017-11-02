

import { EventEmitter, AfterViewInit, OnDestroy, OnInit } from "@angular/core";
import { FormsManagerLocal, FormsManagerService } from "../forms/FormsManger";
import { AppWin } from "./base-window.component";

export class WinContentBase
    implements OnInit, AfterViewInit, OnDestroy {
    
    public formsManager: FormsManagerLocal;
    
    ngOnInit() {
        this.formsManager = FormsManagerService.create(this);
        this.onInit();        
    }

    ngOnDestroy() {
        FormsManagerService.destroy(this);
    }

    ngAfterViewInit() {
        this.parentWin.heightChanged.subscribe((height) => {
            this.heightChanged.emit(height);
        });
    }

    protected onInit() {}

    public heightChanged = new EventEmitter<number>();

    public parentWin: AppWin;

    // public onResize: Function;

    public isSingleton = false;

    public lastThumb = null;

    public onBeforeClose() { };

}