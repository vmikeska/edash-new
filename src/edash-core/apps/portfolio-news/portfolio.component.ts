
import { Component } from "@angular/core";
import * as _ from "lodash";
import { WinContentBase } from "../../../desktop/components/win-content-base";
import { TabItem } from "../../../desktop/controls/tabs.component";
import { ListItem } from "../../../desktop/forms/ListFormControl";

@Component({
  selector: 'portfolio',
  templateUrl: './portfolio.html',
})

export class PortfolioComponent extends WinContentBase {
    
    constructor() {
        super();   
    }

    
    public partners: ListItem[] = [
        {text: "Gas-Union", value: 0, },
    ];

    public tabs: TabItem[] = [
        { id: "ponPeriod", name: "Betrachtungszeitraum"    },
        { id: "ponExport", name: "Export"    }
    ];


}