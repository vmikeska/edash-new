
import { Injectable } from "@angular/core";


import * as _ from "lodash";
import { MenuListService } from "./menu-list-service";
import { MdlgCreationService } from "../../desktop/services/mdlg-creation.service";



@Injectable()
export class PermissionService {

    constructor(
        private _menuListSvc: MenuListService,
        private _modalDlgSvc: MdlgCreationService,
    ) {
        
    }

    private ignorePermission = true;

    public async getPermission(app) {
        let permission = 'none';
        
        let menuResponse = await this._menuListSvc.getValueAsync();
        
        menuResponse.items.forEach((item) => {
            let perm = _.find(item.items, {name: app});
            if (perm) {
                permission = perm.permission;
            }
        });

        return permission;
    }

    public hasPermission(app, level) {
        if (this.ignorePermission) {
            return true;
        }

        let perm = this.getPermission(app);

        let permOk = perm === level;
        if (permOk) {
            this._modalDlgSvc.showInfoDialog("Permission issue", "You don't have sufficient permissions for this operation.")
        }

        return permOk;

    }

}