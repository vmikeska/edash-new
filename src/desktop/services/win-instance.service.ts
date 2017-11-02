

import { FormsManagerService } from '../forms/FormsManger';

import * as html2canvas from "html2canvas";

import { WinContentBase } from '../components/win-content-base';
import { Injectable, Type } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';


@Injectable()
export class WinInstanceService {

    constructor() { }

    public instances: WinContentBase[] = [];
    
    public onChange = new Subject();

    public add(instance: WinContentBase) {
        this.instances.push(instance);
        this.emitChange();
    }

    public closeAll() {
        this.instances.forEach((i) => {
            i.parentWin.closeWin();
        })
    }

    public remove(instance: WinContentBase) {
        this.instances = _.reject(this.instances, (i) => {
            return i === instance;
        });
        this.emitChange();
    }

    public emitChange() {
        this.onChange.next();
    }

    public canCreate(t: Type<WinContentBase>) {

        let inst = this.getInstance(t);

        if (inst) {
            return !inst.isSingleton;
        }

        return true;
    }

    public getInstance(t: Type<WinContentBase>) {
        let inst = _.find(this.instances, (i) => {
            return i instanceof t;
        });

        if (inst) {
            return inst;
        }

        return null;
    }

    private zIndexBase = 1000;

    public bringInstanceToFront(inst: WinContentBase) {

        this.instances.forEach((i) => {
            i.parentWin.topWindow = false;
        })

        let otherInsts = _.reject(this.instances, (i) => {
            return i === inst;
        });
        otherInsts = _.orderBy(otherInsts, (i) => { return i.parentWin.zIndex });

        let ino = this.zIndexBase + 1;
        otherInsts.forEach((i) => {
            i.parentWin.zIndex = ino;
            ino++;
        });

        inst.parentWin.zIndex = ino;
        inst.parentWin.topWindow = true;

        FormsManagerService.activateFormManager(inst);
    }

    public createThumb(inst: WinContentBase) {
        let el = inst.parentWin.contentElement;

        html2canvas(el, {
            onrendered: (canvas) => {
                inst.lastThumb = canvas;
            }
        });
    }
}