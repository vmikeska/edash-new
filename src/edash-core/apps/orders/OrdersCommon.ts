import { Utils } from "../../../common/Utils";




export class OrdersCommon {
    public static customBuysideCellDrawing(value, disVal) {
        let buy = Utils.parseBool(value);

        let txt = buy ? "Kauf" : "VKauf";
        let cls = buy ? "order-buy" : "order-sell";
        return `<span class="order-cell ${cls}">${txt}</span>`
    }
} 