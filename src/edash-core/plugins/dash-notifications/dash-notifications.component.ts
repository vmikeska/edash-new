

import * as _ from "lodash";
import { Subscription } from "rxjs/Subscription";
import { OnInit, Component, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { MessageState, MessagesImportance, Message, NotificationService } from "../../services/notification.service";

@Component({
  selector: 'dash-notifications',
  templateUrl: './dash-notifications.html',  
})

export class DashNotificationsComponent implements OnInit, OnDestroy {
  
  ngOnDestroy() {    
    this.sub.unsubscribe();
    this._notifSvc.markDisplayedAsSeen();
  }

  constructor(
    private _notifSvc: NotificationService, 
    //todo: have a look on this and remove is possible
    private _cdr: ChangeDetectorRef
  ) {

  }

  public messages: Message[];

  public importance = MessagesImportance;

  public sub: Subscription;

  ngOnInit() {
    this.sub = this._notifSvc.messagesSub.subscribe(() => {

      let shouldCallNext = false;

      this._notifSvc.messages.forEach((m) => {
        if (m.status === MessageState.New) {
          m.status = MessageState.Displayed;
          shouldCallNext = true;
        }
      })

      this.messages = this.getDisplayedMessages(this._notifSvc.messages);      

      this._cdr.detectChanges();

      if (shouldCallNext) {
        this._notifSvc.callNext();
      }
    });

    this._notifSvc.callNext();    
  }

  public displayMessages(filter) {
    if (filter === "displayed") {
      this.messages = this.getDisplayedMessages(this._notifSvc.messages);
    }

    if (filter === "all") {
      this.messages = this._notifSvc.messages;
    }
  }

  private getDisplayedMessages(msgs: Message[]) {
    let ms = _.filter(msgs, {status: MessageState.Displayed});
    return ms;
  }

  
  

  



}

