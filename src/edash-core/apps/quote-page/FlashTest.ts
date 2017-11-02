export class FlashTest {
    
      constructor(instrKey) {
        this.instrKey = instrKey;
      }
    
      private instrKey = "00202";
    
      public getItemName() {
        return this.instrKey;
      }
    
      // private changedFields = ["bid_qty", "bid_price", "ask_price", "ask_qty", "last_price", "last_qty"];
      private changedFields = ["bid_price", "last_price", "ask_price"];
    
    
      public forEachChangedField(callback) {
        this.changedFields.forEach((f) => {
          let num = this.getRandom(1.111, 9.999);
          callback(f, 0, num.toFixed(3));
        })
      }
    
      private getRandom(min, max) {
        return Math.random() * (max - min) + min;
      }
    
    }