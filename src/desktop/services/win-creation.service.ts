import { Injectable, ViewContainerRef, Type } from "@angular/core";
import { DynamicCreationService } from "./dynamic-creation.service";
import { WinContentBase } from "../components/win-content-base";
import { AppWin } from "../components/base-window.component";




@Injectable()
export class WinCreationService {

    public windowTarget: ViewContainerRef;

    constructor(private _creationService: DynamicCreationService) {

    }

    public createWinInstance<T extends WinContentBase>(t: Type<T>): WinInstances<T> {

        let winComponentRef = this._creationService.createInstance<AppWin>(AppWin, this.windowTarget);
        
        winComponentRef.instance.componentRef = winComponentRef;

        let contentComponentRef = this._creationService.createInstance(t, winComponentRef.instance.content);
 
        contentComponentRef.instance.parentWin = winComponentRef.instance;

        winComponentRef.instance.contentComponentRef = contentComponentRef;
        winComponentRef.instance.contentComponent = contentComponentRef.instance;
        
        return {
             winInstance: winComponentRef.instance,
             contentInstance: contentComponentRef.instance
        };
    }

    public createWinInst<T extends WinContentBase>(
        t: Type<T>, 
        initCompModel: (model: T)=> void = null, 
        initWinModel: (model: AppWin)=> void = null
        ): WinInstances<T> {

        let winComponentRef = this._creationService.createInst<AppWin>(AppWin, this.windowTarget, initWinModel);
        
        winComponentRef.instance.componentRef = winComponentRef;

        let contentComponentRef = this._creationService.createInst(t, winComponentRef.instance.content, initCompModel);
 
        contentComponentRef.instance.parentWin = winComponentRef.instance;

        winComponentRef.instance.contentComponentRef = contentComponentRef;
        winComponentRef.instance.contentComponent = contentComponentRef.instance;
        
        return {
             winInstance: winComponentRef.instance,
             contentInstance: contentComponentRef.instance
        };
    }

}

export class WinInstances<T> {
    public winInstance: AppWin;
    public contentInstance: T;
}
