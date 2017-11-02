import { Component, Injector, Input, OnChanges, SimpleChanges, ElementRef, Host, AfterViewInit, Inject, ViewChild, ChangeDetectorRef, Output, EventEmitter, NgZone, AfterContentInit } from '@angular/core';
import * as _ from "lodash";
import * as moment from 'moment';

import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

import { WinContentBase } from '../components/win-content-base';
import { Utils } from '../../common/Utils';
import { $ } from '../../common/globals';


@Component({
  selector: 'data-table',
  templateUrl: './data-table.html',
})

export class DataTableComponent implements AfterViewInit {

  public ngAfterViewInit() {
    this.paging.lineHeightSetup(this.table.nativeElement);

    this.refreshPageData();
  }

  constructor(
    private myElement: ElementRef,
    private _zone: NgZone
  ) {
    this.contElement = $(this.myElement.nativeElement).closest(this.contClassName);
  }


  public DataColumnType = DataColumnType;

  @ViewChild('tableWrap')
  private tableWrap: ElementRef;

  @ViewChild('table')
  private table: ElementRef;

  @ViewChild('tableCont')
  private tableCont: ElementRef;

  public sortedColumn: DataTableHeaderItem;
  public sortedAsc?: boolean = null;

  public columnsFilterOpened = false;

  public paging = new PageStateCalc();

  @Input()
  public headers: DataTableHeaderItem[];

  @Input()
  public columnsFilter: boolean = false;

  @Input()
  public headerClass: string = "";

  @Input()
  public cellsClass: string = "";

  @Input()
  public emptyText = "";



  @Input()
  public set observableData(d: Subject<any[]>) {
    d.subscribe((newData) => {
      this._zone.run(() => {
        this.origData = TableUtils.parseItemsFromJson(newData);
        this.refreshAll();
      });
    })
  }

  @Input()
  public set data(d) {
    //this hack might be one day reworked. solves issue afecting view prop after initialization: pageData
    setTimeout(() => {
      this.origData = TableUtils.parseItemsFromJson(d);
      this.refreshAll();
    });
  }

  @Input()
  public set parent(p: WinContentBase) {

    p.heightChanged.subscribe((height) => {
      this.refreshPageData();
    });

  }

  @Input()
  public actionColClass = "";

  @Input()
  public serviceMenuTitle = "";

  @Input()
  public serviceMenuActions: ServiceMenuAction[] = [];

  @Output()
  public onActionMenuClick = new EventEmitter<ActionClickEvent>();

  @Output()
  public onCellDoubleClick = new EventEmitter<CellClickEvent>();

  @Output()
  public onAfterViewChanged = new EventEmitter();

  @Output()
  public onHeaderClicked = new EventEmitter<DataTableHeaderItem>();

  public activeColMenuRow: DataTableRow = null;

  public pageData: DataTableRow[] = [];
  public viewData: DataTableRow[] = [];
  private origData: DataTableRow[] = [];

  private contClassName = "table-parent-cont";

  private contElement;

  private scrollbarSizePx = 17;

  public actionClicked(action: string, row: DataTableRow) {

    let evnt: ActionClickEvent = {
      action: action,
      row: row
    };

    this.onActionMenuClick.emit(evnt);
  }

  public headerClicked(h: DataTableHeaderItem) {
    this.onHeaderClicked.emit(h);
  }

  public filterClick() {
    this.columnsFilterOpened = !this.columnsFilterOpened;
  }

  public pageChangeClick(dir: number) {

    this.paging.pageChange(dir);
    this.refreshPageData();
  }

  public sortBtnClick(h) {

    if (this.sortedColumn !== null && h !== this.sortedColumn) {
      this.sortedAsc = null;
    }

    this.sortedColumn = h;

    if (this.sortedAsc !== null) {
      this.sortedAsc = !this.sortedAsc
    } else {
      this.sortedAsc = true;
    }

    this.orderByColumn(this.sortedAsc, this.sortedColumn.col);

  }

  public cellDoubleClick(row: DataTableRow, col, e) {

    let fullRow = _.find(this.viewData, { origRowNo: row.origRowNo });

    let evnt: CellClickEvent = {
      row: fullRow.origRow,
      col: col,
      event: e
    };

    this.onCellDoubleClick.emit(evnt);
  }



  public refreshAll() {
    this.refreshData();
    this.refreshPageData();

    this.onAfterViewChanged.emit();
  }

  private refreshData() {
    this.viewData = this.orderColumnsByHeader(this.origData);
    this.paging.newDataCount(this.viewData.length);
  }

  private refreshPageData() {
    if (this.viewData.length === 0) {
      this.pageData = [];
      return;
    }

    this.paging.newHeight(this.availableHeight);

    this.pageData = this.viewData.slice(this.paging.pageStart, this.paging.pageEnd);
  }

  private get availableHeight() {
    let ah = this.contElement.clientHeight;

    if (this.hasScrollbar) {
      ah = ah - this.scrollbarSizePx;
    }

    return ah;
  }

  private get hasScrollbar() {
    let res = this.tableCont.nativeElement.scrollWidth - this.tableWrap.nativeElement.scrollWidth !== 0;
    return res;
  }

  private orderColumnsByHeader(inRows: DataTableRow[]) {
    let outRows = [];

    inRows.forEach((oldRow) => {

      let outRow = new DataTableRow([]);
      outRow.origRowNo = outRows.length;
      outRow.origRow = oldRow;

      this.headers.forEach((h) => {
        let cell: DataTableColumnItem = _.find(oldRow.items, { col: h.col });
        //todo: possibly should create empty cell in this case, could cause bugs when orderByColumn
        if (cell) {

          cell.disVal = this.convertDisVal(cell.value, h.type, h.typeArgs);
          cell.sortVal = this.convertSortVal(cell.value, h.type);

          outRow.items.push(cell);
        }
      });

      outRows.push(outRow);
    });

    return outRows;
  }

  public getRowByColAndKey(col: string, val: any) {

    let res: FoundRow = {
      isVisible: false,
      row: null
    };

    _.forEach(this.viewData, (row) => {
      let foundIdCol = _.find(row.origRow.items, (cell: DataTableColumnItem) => {
        return cell.col === col && cell.value == val;
      });
      if (foundIdCol) {
        res.row = row;
        res.isVisible = this.pageData.includes(row);
        return false;
      }
    });

    return res;
  }

  private convertDisVal(val: any, type: DataColumnType, typeArgs: string) {

    if (Utils.isNullOrUndefined(val)) {
      return null;
    }

    let outVal = val.toString();

    //do nothing
    //DataColumnType.TypeString 
    //DataColumnType.TypeHtml
    //DataColumnType.TypeInt

    if (type === DataColumnType.TypeDateMoment) {
      outVal = val.format(typeArgs);
    }

    if (type === DataColumnType.TypeCheckbox) {
      outVal = val;
    }

    if (type === DataColumnType.TypeFloat) {
      let v = parseFloat(val);
      if (isNaN(v)) {
        //todo: throw something or not ?
      }

      if (typeArgs) {
        let prms = typeArgs.split(".");

        let decPrm = prms[1];
        if (decPrm.length > 0) {
          let decimals = parseInt(prms[1]);
          outVal = v.toFixed(decimals);
        }

      } else {
        outVal = v;
      }

    }

    return outVal;
  }

  private convertSortVal(val: any, type: DataColumnType) {

    if (Utils.isNullOrUndefined(val)) {
      return null;
    }

    let outVal = val.toString().toLowerCase();

    if (type === DataColumnType.TypeString) {
      return outVal;
    }

    if (type === DataColumnType.TypeHtml) {
      return val.toString();
    }

    if (type === DataColumnType.TypeDateMoment) {
      return val.toDate();
    }

    if (type === DataColumnType.TypeCheckbox) {
      return val;
    }

    if (type === DataColumnType.TypeInt) {
      let v = parseInt(val);
      if (isNaN(v)) {
        //todo: throw something ?
      }
      return v;
    }

    if (type === DataColumnType.TypeFloat) {
      let v = parseFloat(val);
      if (isNaN(v)) {
        //todo: throw something ?
      }
      return v;
    }

    return outVal;
  }

  public orderByColumn(asc: boolean, colName: string) {

    var temps: SortingCell[] = _.map(this.viewData, (row) => {
      let cell = _.find(row.items, { col: colName });

      let temp: SortingCell = {
        value: cell.sortVal,
        rowNo: row.origRowNo
      };
      return temp;
    });

    let sortedTemps = _.sortBy(temps, ["value"]);

    if (!asc) {
      sortedTemps = sortedTemps.reverse();
    }

    let v = _.map(sortedTemps, (t) => {
      let r = _.find(this.viewData, { origRowNo: t.rowNo });
      return r;
    });

    this.viewData = v;
    this.refreshPageData();
  }

  public getHeaderColByName(col) {
    let c = _.find(this.headers, { col: col });
    return c;
  }

  public onCheckboxChangeHandler(checked: boolean, row: DataTableRow, col: string) {
    let evnt: CheckboxChanedEvent = { checked, row, col };
    this.onCheckboxChange.emit(evnt);
  }

  @Output()
  public onCheckboxChange = new EventEmitter<CheckboxChanedEvent>();

  //please keep
  // public deleteItems(compareFnc: Function) {
  //   this.origData = _.reject(this.origData, (d) => compareFnc(d));
  //   this.refreshAll();
  // }

}

export interface CheckboxChanedEvent {
  checked: boolean;
  row: DataTableRow;
  col: string;
}

export class ActionClickEvent {
  public action: string;
  public row: DataTableRow;
}

export class PageStateCalc {

  private rowHeight = 0;

  public pageNo = 1;
  private maxPageNo = 1;
  public displayBy = 5;
  public showPaging = false;

  public pageStart = 0;
  public pageEnd = 0;

  private cnt = 0;

  private fontSize = 0;


  private lineHeight = 2.2;

  public newDataCount(cnt: number) {
    this.cnt = cnt;
  }

  public lineHeightSetup(element) {
    this.fontSize = Utils.getFontSize(element);
    this.rowHeight = this.fontSize * this.lineHeight;
  }

  public newHeight(height: number) {
    let availableRows = Math.floor(height / this.rowHeight);

    let reservedRows = 2;

    this.displayBy = availableRows - reservedRows;
    this.displayBy = Utils.assureRange(this.displayBy, 1, null);

    this.calculateMaxPageNo();
    this.pageNo = Utils.assureRange(this.pageNo, 1, this.maxPageNo);

    this.pageStart = (this.pageNo - 1) * this.displayBy;
    this.pageEnd = this.pageStart + this.displayBy;
  }

  public pageChange(dir: number) {

    if (this.pageNo <= 1 && dir < 0) {
      return;
    }

    if (dir > 0 && this.pageNo >= this.maxPageNo) {
      return;
    }

    this.pageNo = this.pageNo + dir;
  }

  private calculateMaxPageNo() {
    this.maxPageNo = Math.ceil(this.cnt / this.displayBy);
    this.showPaging = this.shouldShowPaging;
  }

  private get shouldShowPaging() {
    return this.cnt > this.displayBy;
  }
}

export class TableUtils {
  public static parseItemsFromJson(items): DataTableRow[] {
    let rows: DataTableRow[] = [];

    items.forEach(item => {
      let row: DataTableRow = this.parseItemFromJson(item);
      rows.push(row);
    });

    return rows;
  }

  public static parseItemFromJson(item): DataTableRow {
    let row = new DataTableRow([]);

    for (var name in item) {
      if (item.hasOwnProperty(name)) {
        let cell = new DataTableColumnItem();
        cell.col = name;
        cell.value = item[name];
        row.items.push(cell);
      }
    }

    return row;
  }
}

class SortingCell {
  public value: string;
  public rowNo: number;
}

export class ServiceMenuAction {
  public action: string;
  public icon: string;
  public text: string;
  public setVisibility?: (row: DataTableRow) => boolean;
}

export class FoundRow {
  public isVisible: boolean;
  public row: DataTableRow;
}

export class CellClickEvent {
  public row: DataTableRow;
  public col: DataTableColumnItem;
  public event: MouseEvent;
}

export class DataTableHeaderItem {
  public name: string;
  public col: string;
  public visible: boolean;
  public type?: DataColumnType;
  public typeArgs?: string;
  public cellClass?: string;
  public headerClass?: string;
  public headerTitle?: string;
  public hideSortButton?: boolean;
  public hidden?: boolean;
  public customCellDrawing?: (value, disVal) => string;
}

export class DataTableRow {

  constructor(items: DataTableColumnItem[]) {
    this.items = items;
  }

  public items: DataTableColumnItem[];
  public origRow?: DataTableRow;
  public origRowNo?: number;

  public getCol(col) {
    let c = _.find(this.items, { col: col });
    return c;
  }

  public getVal(col: string) {
    let c = this.getCol(col);
    return c.value;
  }

  public toJson(): any {
    let json = {};

    this.items.forEach((i) => {
      json[i.col] = i.value;
    })

    return json;
  }

  public toJsonTyped<T>(): T {
    let res = this.toJson();
    return <T>res;
  }
}

export class DataTableColumnItem {
  public disVal?: string;
  public sortVal?: any;
  public value: any;
  public col: string;

  public beforeTextStyle?: string;
  public afterTextStyle?: string;


  public flashing = false;
  public flashCell() {
    let duration = 700;
    this.flashing = true;

    setTimeout(() => {
      this.flashing = false;
    }, duration);
  }
}

export enum DataColumnType {
  TypeString,
  TypeInt,
  TypeFloat,
  TypeCheckbox,

  TypeHtml,
  TypeDateMoment,

}

