import { NgZone } from "@angular/core";

import * as _ from "lodash";
import { DataTableComponent } from "../../../desktop/controls/data-table.component";

export class SyncedSorting {
    private instrKeys: string[];
    private started = false;
    private table: DataTableComponent;
    // private zone: NgZone;
  
    constructor(table: DataTableComponent, private zone: NgZone) {
      this.table = table;
      // this.zone = zone
    }
  
    public start(instrKeys: string[]) {
      this.instrKeys = instrKeys;
      this.started = true;
    }
  
    public receive(instrKey: string) {
      if (!this.started) {
        return;
      }
  
      _.pull(this.instrKeys, instrKey);
  
      if (this.instrKeys.length === 0) {
        this.started = false;
        this.sort();
  
        // setTimeout(() => {
        //   console.log("refreshing");
        //   this.table.refreshAll();        
        // }, 1000);
      }
    }
  
    private sort() {
      this.zone.run(() => {
        this.table.orderByColumn(true, "alias");
      })
  
    }
  
  }