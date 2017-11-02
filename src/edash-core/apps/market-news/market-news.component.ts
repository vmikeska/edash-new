
import { Component, OnInit, ViewChild } from "@angular/core";
import * as moment from 'moment';
import * as _ from "lodash";
import { WinContentBase } from "../../../desktop/components/win-content-base";
import { ApiCommService } from "../../services/api-comm.service";
import { DataTableHeaderItem, ServiceMenuAction, ActionClickEvent, DataColumnType } from "../../../desktop/controls/data-table.component";



@Component({
    selector: 'market-news',
    templateUrl: './market-news.html',
})

export class MarketNewsComponent
    extends WinContentBase
     {
    async onInit() {
        let data = await this.getData();
        let items = await this.mapData(data);

        let itemsSorted = _.sortBy(items, "dateSort").reverse();

        this.data = itemsSorted;
    }

    constructor(private _apiComm: ApiCommService) {
        super();
    }

   

    public dataHeaders: DataTableHeaderItem[] = [
        { name: "Stichtag", col: "date", type: DataColumnType.TypeDateMoment, typeArgs: "ll", visible: true },
        { name: "Beschriebung", col: "description", visible: true },        
    ]

    public customActions: ServiceMenuAction[] = [
        {
            action: "Download",
            icon: "icon-floppy-o",
            text: "Download"
        }

    ];

    public actionClick(e: ActionClickEvent) {

        if (e.action === "Download") {
            let link = e.row.origRow.getCol("link").value;            
            window.location.href = link;            
        }

    }

    private async getData() {
        let url = "documents";
        let items = await this._apiComm.apiGetAsync<NewsResponse[]>(url);

        return items;
    }

    private mapData(items: NewsResponse[]) {
        let data = _.map(items, (i) => {

            let link = this._apiComm.getApiUrl(`documents/${i.id}`);
            let date = moment(i.validity, "YYYY-MM-DD");
     
            let n: NewsVM = {
                date: date,
                dateSort: date.toDate(),
                description: i.description,
                link: link
            };

            return n;
        });

        return data;
    }

    public data: NewsVM[] = [];

}

export interface NewsResponse {
    description: string;
    filename: string;
    id: number;
    mediatype: string;
    validity: string;
}

export interface NewsVM {
    date: moment.Moment;
    dateSort: Date;
    description: string;
    link: string;
}