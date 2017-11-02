import { DashboardComponent } from "./dashboard.component";
import { Subject } from "rxjs/Subject";

export class MenuCloser {
    
      private duration = 2000;
    
      private menuCloseDelay = null;
    
      private dash: DashboardComponent;

      public onTimeout = new Subject();
    
      constructor(dash: DashboardComponent) {
        this.dash = dash;
      }
    
      public mouseEnter() {
        this.stopCounter();
      }
    
      public mouseLeave() {
        this.stopCounter();
        this.startCounter();
      }
    
      private startCounter() {
        this.menuCloseDelay = setTimeout(() => {
          this.onTimeout.next();          
        }, this.duration);
      }
    
      private stopCounter() {
        if (this.menuCloseDelay !== null) {
          clearTimeout(this.menuCloseDelay);
          this.menuCloseDelay = null;
        }
      }
    
    }