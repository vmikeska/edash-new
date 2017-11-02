
import { Component, OnInit, ChangeDetectorRef, NgZone, Input } from '@angular/core';

import * as moment from 'moment';
import { InsturmentUpdateEvent, QuotePageSubscriptionService } from './quote-page-subscription.service';
import { FlashTest } from './FlashTest';
import { InstrumentVM } from './InstrumentVM';
import { DlgContentBase } from '../../../desktop/components/dlg-content-base';
import { OrderRequest } from '../../services/orders.service';

@Component({
    selector: 'sell-form',
    templateUrl: 'sell-form.html'
})

export class SellFormComponent
    extends DlgContentBase
    implements OnInit {

    ngOnInit() {
        this.createSubscription();

        this.parentWin.buttonsManager.addEasyButton("Test", () => {
            let fakeData = new FlashTest(this.instrument.instrKey);
            this.processPriceUpdate(fakeData);
        })
    }

    constructor(public _subscribtionSvc: QuotePageSubscriptionService,) {
        super();
    }

    public parentId: string;

    public instrument: InstrumentVM;

    public buying: boolean;

    public type: string;

    public quantity = 0;
    public price = 0;

    public expires = this.initialExpires();


    public goodTillCanceled = true;

    public gtcChange(e) {
        this.goodTillCanceled = e.target.checked;
    }

    private initialExpires() {
        let d = moment().hours(17).minutes(0);
        return d;
    }

    private get expiresStr() {
        return this.expires.format("YYYY-MM-DD hh:mm");
    }

    public bidFlash = false;
    public askFlash = false;

    private createSubscription() {

        let svc = this._subscribtionSvc.getOrCreateInstance(this.parentId);

        svc.onItemUpdate.subscribe((e: InsturmentUpdateEvent) => {
            let isSnapshot = e.data.isSnapshot();
            if (isSnapshot) {
                return;
            }

            let instrKey = e.data.getItemName();

            let isThisOrder = instrKey === this.instrument.instrKey;
            if (isThisOrder) {
                this.processPriceUpdate(e.data);
            }

        })
    }

    private processPriceUpdate(data) {

        data.forEachChangedField((name, pos, val) => {

            if (name === 'bid_price') {
                let price = parseFloat(val);
                this.instrument.bid_price = price;

                this.bidFlash = true;
                this.flashCell(() => {
                    this.bidFlash = false;
                })
            }
            if (name === 'ask_price') {
                let price = parseFloat(val);
                this.instrument.ask_price = price;

                this.askFlash = true;
                this.flashCell(() => {
                    this.askFlash = false;
                })
            }

        });
    }

    private flashCell(callback) {
        let duration = 700;

        setTimeout(() => {
            callback();
        }, duration);
    }



    public getRequestData() {

        let order: OrderRequest = {
            i: this.instrument.instrId,
            e: this.instrument.exchangeId,
            buyside: this.buying,
            type: this.type,
            minAmount: this.instrument.minAmount,
            maxAmount: this.instrument.maxAmount,
            Value: this.quantity * this.price * this.instrument.deliveryHours,
            limit: this.price,
            quantity: this.quantity,
            deliverHours: this.instrument.deliveryHours,
            instrKey: this.instrument.instrKey,
            ask: this.instrument.ask_price,
            bid: this.instrument.bid_price,
            expires: ""
        };

        if (!this.goodTillCanceled) {
            order.expires = this.expiresStr;
        }

        return order;
    }

    public quantityOrPriceChange() {
        this.updateOrderForm();
    }

    private updateOrderForm() {
        let hasChanges = false;
        if (this.buying) {
            if (this.price < this.instrument.ask_price) {
                if (this.type != 'limit') {
                    this.type = 'limit';
                }
            }
            else {
                if (this.type != 'market') {
                    this.type = 'market';
                }
            }
        }
        else {
            if (this.price > this.instrument.bid_price) {
                if (this.type != 'limit') {
                    this.type = 'limit';
                }
            }
            else {
                if (this.type != 'market') {
                    this.type = 'market';
                }
            }
        }
    }



}


