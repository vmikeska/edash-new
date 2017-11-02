
import { Injectable } from '@angular/core';
import { AppBuildingService } from '../../../desktop/services/app-building.service';
import { DebugWinComponent } from '../../../custom/apps/debug-win/debug-win.component';

@Injectable()
export class TestBtnService {

    constructor(private _winBuildSvc: AppBuildingService) { 
        
        
    }

    public execute() {
        
        
            let insts = this._winBuildSvc.activateWin<DebugWinComponent>(DebugWinComponent,
                (inst) => {
                    inst.isSingleton = true;
                },
                (inst) => {
                    inst.title = "Debug";
                    this._winBuildSvc.buildWinModel(inst, 300, 200)
                });
        
    }
}