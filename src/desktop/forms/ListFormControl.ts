import { FormControl } from "./FormControl";
import { ElementRef, Input, Output, EventEmitter } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { Utils } from "../../common/Utils";

import * as _ from "lodash";

export class ListFormControl extends FormControl {

    constructor(_elem: ElementRef) {
        super(_elem);
    }

    public onInit() {
        super.onInit();

        let n = this.name;

        if (this.items) {
            this.numberItems();
            this.onDataChanged();
        }

        if (this.data) {
            this.items = this.mapData(this.data);
            this.onDataChanged();
        }

        if (this.dataObservable) {
            this.dataObservable.subscribe((data) => {
                this.data = data;
                this.items = this.mapData(this.data);
                this.onDataChanged();
            })
        }

        if (this.itemsObservable) {
            this.itemsObservable.subscribe((items) => {
                this.items = items;
                this.onDataChanged();
            })
        }

        this.createListMovingSubscription();

    }


    @Input()
    public items: ListItem[];

    @Input()
    public itemsObservable: Subject<ListItem[]>;

    @Input()
    public data: any[];

    @Input()
    public dataObservable: Subject<any[]>;

    @Input()
    public set mapping(val: string) {
        //todo: custom exception if mapping doesn't work

        let prms = val.split(",");
        this.textMapping = prms[0];
        this.valueMapping = prms[1];
    }

    @Input()
    public selectFirst = true;

    @Input()
    public singleSelection = true;

    @Input()
    public linesCount = 4;

    @Input()
    public lineHeight = 2;

    public totalHeight: number;


    @Output()
    public selectedItemChange = new EventEmitter<SelectionChangedEvent>();

    @Output()
    public activeItemChange = new EventEmitter<ListItem>();

    @Output()
    public onItemsChanged = new EventEmitter();

    public lastAffectedItem: ListItem = null;

    private defaultValueInternal = null;

    @Input()
    public set defaultValue(val: any) {
        this.defaultValueInternal = val;
    }

    public get defaultValue() {
        return this.defaultValueInternal;
    }

    public activeItem: ListItem = null;

    public hideActiveAfterSelection = true;

    protected textMapping;
    protected valueMapping;

    public onDataChanged() {
        this.numberItems();

        if (this.defaultValue != null) {

            let isArray = Utils.isArray(this.defaultValue);
            if (isArray) {

                this.defaultValue.forEach((val) => {
                    let item = _.find(this.items, { value: val });
                    this.revertItemSelection(item);
                })

            } else {
                let item = _.find(this.items, { value: this.defaultValue });
                this.revertItemSelection(item);
            }


        } else if (this.selectFirst) {
            if (this.items) {
                let item = this.items[0];
                this.revertItemSelection(item);
            }
        }

        this.onItemsChanged.emit();
    }

    private createListMovingSubscription() {
        this.activeItemChange.subscribe((item: ListItem) => {

            let currentLine = item.index + 1;
            let oneLineHeight = this.fontSize * this.lineHeight;

            let fromLine = (this.listContainer.scrollTop / oneLineHeight) + 1;
            let toLine = fromLine + this.linesCount - 1;

            if (currentLine < fromLine) {
                let topPx = (currentLine - 1) * oneLineHeight;
                this.listContainer.scrollTop = topPx;
            }

            if (currentLine > toLine) {
                let topPx = (currentLine - this.linesCount) * oneLineHeight;
                this.listContainer.scrollTop = topPx;
            }

        })
    }

    protected changeActiveItem(direction: number) {

        if (!this.activeItem) {
            let selItems = this.getSelectedItems();

            let startItem = Utils.any(selItems) ? _.last(selItems) : this.items[0];

            this.activeItem = startItem;
        } else {

            let newIndex = this.activeItem.index + direction;
            if (newIndex < 0) {
                newIndex = this.items.length - 1;
            }
            if (newIndex > this.items.length - 1) {
                newIndex = 0;
            }

            let next = _.find(this.items, (i) => { return i.index === newIndex });
            this.activeItem = next;
        }

        this.activeItemChange.emit(this.activeItem);
    }

    protected get listContainer() {
        return this._elem.nativeElement;
    }

    public itemClicked(i: ListItem) {
        if (this.singleSelection) {
            this.unselectAll();
        }

        this.revertItemSelection(i);

        if (this.hideActiveAfterSelection) {
            this.activeItem = null;
        }

        this.itemClickedCustom(i);
    }

    protected itemClickedCustom(i: ListItem) { }

    public revertItemSelection(item: ListItem) {
        item.selected = !item.selected;
        this.lastAffectedItem = item;
        this.selectionChanged();
    }

    public selectionChanged() {
        let selected = this.getSelectedItems();

        let e: SelectionChangedEvent = {
            changed: this.lastAffectedItem,
            selected: selected
        };

        //this is hack, how to call it after the initialization
        setTimeout(() => {
            this.selectedItemChange.emit(e);
            this.formValueChange();
        }, 10);
    }

    protected unselectAll() {
        this.items.forEach((i) => {
            i.selected = false;
        });
    }

    public getSelectedItems() {
        let active = _.filter(this.items, (i) => {
            return i.selected;
        });
        return active;
    }

    public get formValue() {
        return this.getSelectedItems();
    }

    public getCurrentItemClass(item: ListItem) {
        let res = "";

        if (item.selected) {
            res = "selected";
        }

        if (item === this.activeItem) {
            res += " active";
        }

        return res;
    }


    private mapData(data: any[]) {
        //todo: custom exception if mapping is not set

        let outItems = _.map(data, (i) => {

            let item: ListItem = {
                text: this.prop(i, this.textMapping),
                value: this.prop(i, this.valueMapping),
                origModel: i,

            };

            return item;
        });

        return outItems;
    }

    protected resizeHeight() {
        this.totalHeight = this.linesCount * (this.fontSize * this.lineHeight);
    }

    private numberItems() {
        for (let act = 0; act <= this.items.length - 1; act++) {
            this.items[act].index = act;
        }
    }


    protected prop(obj, path) {
        var val = path.split('.').reduce((a, b) => a[b], obj);
        return val;
    }
}

export class ListItem {
    text: string;
    value: any;
    selected?: boolean;
    origModel?: any;
    index?: number;

    editing?: boolean;
}

export class SelectionChangedEvent {
    public changed: ListItem;
    public selected: ListItem[];
}
