
//https://trackjs.com/blog/monitoring-javascript-memory/


import { Component, AfterViewInit } from '@angular/core';
import { WinContentBase } from '../../../desktop/components/win-content-base';
import { ApiCommService } from '../../../edash-core/services/api-comm.service';


import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ControlsForm } from '../../../desktop/forms/ControlsForm';

@Component({
    selector: 'debug-win',
    templateUrl: 'debug-win.html'

})
export class DebugWinComponent extends WinContentBase implements AfterViewInit {


    constructor() {
        super();

        
    }

    public ngAfterViewInit() {
        
    }



    onInit() {
        this.start();

    }

    public value = "0";

    private start() {
        setInterval(() => {
            let mem = window.performance["memory"];
            let sizeByes = mem.totalJSHeapSize
            //usedJSHeapSize
            let sizeMb = (sizeByes / 1048576).toFixed(3);

            this.value = sizeMb;
        }, 1000);
    }
}
