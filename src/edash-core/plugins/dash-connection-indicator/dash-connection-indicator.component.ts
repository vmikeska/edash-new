

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LightstreamerService } from '../../services/lightstreamer.service';


@Component({
    selector: 'dash-connection-indicator',
    templateUrl: 'dash-connection-indicator.html'
})


export class DashConnectionIndicatorComponent implements OnInit {
    constructor(private cdr: ChangeDetectorRef, public _lsSvc: LightstreamerService) {
        this.setStatus(this._lsSvc.status);
        
        this._lsSvc.statusChanged.subscribe((status) => {            
            this.setStatus(status);
             this.cdr.detectChanges();
        });
    }

    //official workaround
    public lsColorState = LsColorState;

    public stateColor = LsColorState.Red;
    public stateText = "Disconnected"

    private setStatus(status) {

        switch (status) {
            case 'CONNECTING':
                this.stateColor = LsColorState.Yellow;
                this.stateText = "Connecting";
                break;

            case 'CONNECTED:HTTP-POLLING':
            case 'CONNECTED:WS-STREAMING':
            case 'CONNECTED:WS-POLLING':            
                this.stateColor = LsColorState.Green;
                this.stateText = "Connected";
                break;

            case 'DISCONNECTED:WILL-RETRY':
                this.stateColor = LsColorState.Yellow;
                this.stateText = "Re-connecting";
                break;

            case 'DISCONNECTED':
                this.stateColor = LsColorState.Red;
                this.stateText = "Disconnected";
                break;
        }

    }

    ngOnInit() {
       
    }
}

export enum LsColorState { Green, Yellow, Red }