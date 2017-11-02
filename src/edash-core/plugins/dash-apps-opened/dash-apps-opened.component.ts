import { Component, OnInit, Directive, Input, OnDestroy, ElementRef, ViewChild } from '@angular/core';

import * as moment from 'moment';
import * as _ from "lodash";
import { WinContentBase } from '../../../desktop/components/win-content-base';
import { WinInstanceService } from '../../../desktop/services/win-instance.service';

@Component({
  selector: 'dash-apps-opened',
  templateUrl: './dash-apps-opened.html'
})

export class DashAppsOpenedComponent 
  implements OnInit {

  ngOnInit() {    
    this.subscribeInstsChange();
  }

  constructor(public _winInstSvc: WinInstanceService) {

  }

  public instances = this.hiddenInstances;  

  public closeAll() {
    this._winInstSvc.closeAll();
  }

  private subscribeInstsChange() {
    this._winInstSvc.onChange.subscribe(() => {      
      this.instances = this.hiddenInstances;
    });
  }

  private get hiddenInstances() {
    let hidden = _.filter(this._winInstSvc.instances, (i: WinContentBase) => {return !i.parentWin.visible});
    return hidden;
  } 

  public itemClicked(inst: WinContentBase) {    
    inst.parentWin.show(true);
  }

  public itemEnter(inst: WinContentBase) {    
      inst.parentWin.visibleTemp = true;    
  }

  public itemOut(inst: WinContentBase) {
    inst.parentWin.visibleTemp = false;    
  }
}

