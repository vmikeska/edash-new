
import { Component, OnInit, Input, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { AppWin } from '../../desktop/components/base-window.component';
import { DelayedReturn } from '../../common/DelayedReturn';

declare var Highcharts;

@Component({
    selector: 'stock-chart',
    templateUrl: 'stock-chart.html'
})

export class StockChartComponent implements OnInit {

    constructor(private _elem: ElementRef) { }

    @Input()
    public options;

    @Input()
    public parentWin: AppWin;

    public instance;

    private delayedResize = new DelayedReturn(100);
    private currentCalls = 0;
    private redrawEachCalls = 20;

    @ViewChild("insertCont")
    public insertCont;

    private cont;
    private get container() {
        if (!this.cont) {
            this.cont = this._elem.nativeElement.parentElement;
        }

        return this.cont;
    }

    public ngOnInit() {
        if (this.options) {
            this.createChart(this.options);
        }
    }

    public async createChart(options) {
        this.instance = await this.createChartInst(options);
        this.initChartResizing();
    }

    @Output()
    public onResize = new EventEmitter();

    private initChartResizing() {
        this.delayedResize.callback = () => {
            this.onResize.emit();

            this.resizeComponent();
            this.currentCalls = 0;
        }

        if (this.parentWin) {
            this.parentWin.sizeChanged.subscribe(() => {
                this.currentCalls++;

                if (this.currentCalls >= this.redrawEachCalls) {
                    this.delayedResize.execute();
                    this.currentCalls = 0;
                } else {
                    this.delayedResize.call();
                }

            });
        }
    }

    public get chartWidth(): number {
        if (!this.instance) {
            return this.container.clientWidth;
        }

        let w = this.instance.chartWidth;
        return w;
    }

    public get chartHeight(): number {
        if (!this.instance) {
            return this.container.clientHeight;
        }

        let h = this.instance.chartHeight;
        return h;
    }

    public resizeComponent() {
        if (!this.instance) {
            return;
        }

        let h = this.container.clientHeight;
        let w = this.container.clientWidth;

        this.instance.setSize(w, h, false);
    }

    private async createChartInst(options) {
        return new Promise((finsih) => {
            setTimeout(() => {
                let inst = Highcharts.StockChart(this.insertCont.nativeElement, options);
                finsih(inst);
            });
        })
    }
}