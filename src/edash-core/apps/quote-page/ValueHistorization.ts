import { LastValue } from "./LastValue";
import * as _ from "lodash";

export class ValueHistorization {
    private lastValues: LastValue[] = [];
  
    public getValue(key: string, col: string) {
      let item = _.find(this.lastValues, { key: key, col: col });
  
      if (!item) {
        return null;
      }
  
      return item;
    }
  
    public addOrUpdateValue(key: string, col: string, value: number, oldVal: number) {
  
      let item = this.getValue(key, col);
  
      if (item) {
        item.raised = value > item.value;
        item.value = value;
      } else {
  
        let i: LastValue = {
          col: col,
          key: key,
          value: value,
          raised: value > oldVal
        };
        this.lastValues.push(i);
      }
  
    }
  }