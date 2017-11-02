
import * as _ from "lodash";
import { ControlsForm } from "./ControlsForm";

export class FormsManagerDictItem {
    public instance: any;
    public manager: FormsManagerLocal;
}

export class FormsManagerService {

    private static managersDict: FormsManagerDictItem[] = [];

    public static create(instance) {
        let manager = new FormsManagerLocal();
        manager.instance = instance;
        
        let dictItem: FormsManagerDictItem = {
            instance: instance,
            manager: manager
        };

        this.managersDict.push(dictItem);        

        return manager;
    }

    public static destroy(instance) {
        let inst = this.getByInstance(instance);
        _.pull(this.managersDict, inst);
    }

    public static getByInstance(instance) {
         let inst = _.find(this.managersDict, (i) => { return i.instance === instance });
         return inst;
    }
    
    public static activeInstance;

    public static activateFormManager(instance) {

        if (this.activeInstance === instance) {            
            return;
        } 

        this.activeInstance = instance;

        this.deactivateAllForms();

        let inst = _.find(this.managersDict, (i) => { return i.instance === instance });
        
        if (inst) {
            inst.manager.activate();
        }
    }

    public static deactivateAllForms() {
        this.managersDict.forEach((dict) => {
            let mgr = dict.manager;
            mgr.deactivate();
        })
    }

}

export class FormsManagerLocal {

    public instance;

    public defaultForm = new ControlsForm();

    public forms: ControlsForm[] = [this.defaultForm];

    public createForm() {
        let form = new ControlsForm();
        this.forms.push(form);
        return form;
    }

    public activate() {
        this.defaultForm.activateForm();
    }

    public deactivate() {
        this.forms.forEach((form) => {
            form.unsetTabIndex();
        })
    }

}