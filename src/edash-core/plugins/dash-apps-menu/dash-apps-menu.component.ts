import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import * as _ from "lodash";

import { MenuListService, MenuItem } from '../../services/menu-list-service';
import { AppsFactoryService } from '../../../config/apps-factory-service';
import { Utils } from '../../../common/Utils';



@Component({
  selector: 'dash-apps-menu',
  templateUrl: './dash-apps-menu.html'
})

export class DashAppsMenuComponent  
  implements OnInit {

  async ngOnInit() {
    await this.generateMenu();
  }

  constructor(
    private _appsFactorySvc: AppsFactoryService,
    private _menuListSvc: MenuListService,    
  ) {
    
  }

  public items: MenuItemVM[];
  public subItems: MenuSubItem[] = [];

  public openItem(i: MenuItemVM) {
    let lineHeight = 39;
    let maxLines = this.items.length;
    let subItemsCount = i.items.length;

    let maxPos = maxLines - subItemsCount;
    let index = Utils.assureRange(i.index, 0, maxPos);

    this.menuGapPx = index * lineHeight;

    this.subItems = i.items;
  }

  private itemClicked(item: MenuSubItem) {
    this._appsFactorySvc.createApp(item.id);
    this.itemClickedOut.emit(item);
  }

  @Output()
  public itemClickedOut = new EventEmitter<MenuSubItem>();

  public menuGapPx = 0;

  private async generateMenu() {    
    let response = await this._menuListSvc.getValueAsync(); 
    this.items = this.mapMenuResponse(response.items);

    let testRoot: MenuItemVM = {
      id: "TestRoot",
      text: "Test",
      items: [{id: "TEST_PAGE", text: "controls"}],
      active: false,
      ico: "",
      index: 10
    }

    this.items.push(testRoot);
    
  }

  private mapMenuResponse(responseItems: MenuItem[]) {
    let index = 0;

    let items: MenuItemVM[] = _.map(responseItems, (mItem) => {

      let m: MenuItemVM = {
        text: mItem.name,
        id: mItem.name,
        ico: "",//this.getIcoById(mItem.name),
        active: false,
        index: index,
        items: _.map(mItem.items, (sItem) => {
          let s: MenuSubItem = {
            id: sItem.name,
            text: this.getTextById(sItem.name)
          };
          return s;
        })
      };

      index++;

      return m;
    });

    return items;
  }

  private getTextById(id) {
    switch (id) {
      case "EMS": return "Marktbericht";
      case "PORTFOLIO": return "Portfolio";
      case "RTDATA": return "Handelsschirm";
      case "ORDERS": return "Orders";

      case "RTCHART": return "Echtzeit Chart";

      case "HIST_CHART": return "Historicher Chart";
      case "EOD": return "EOD Daten";
      case "ALERTS": return "Limitwarnung";
      case "LCUPLOAD": return "Lastgangmanagement";
      case "LCURVE": return "Lastgangbepreisung";
      case "CUSTCLUSTER": return "Lastgangaufschlag";

      case "MEMORY_DEBUG": return "Memory debug";
      case "TEST_PAGE": return "Test page";
    }

  }

}


export class MenuItemVM {
  public id: string;
  public text: string;
  public ico: string;
  public active?: boolean;
  public index: number;

  public items: MenuSubItem[];

}

export class MenuSubItem {
  public id: string;
  public text: string;
}


