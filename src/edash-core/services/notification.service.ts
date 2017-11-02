

import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from "rxjs/Subject";

import * as moment from 'moment';

@Injectable()
export class NotificationService {

    public messagesSub = new Subject<Message[]>();

    public messages: Message[] = [];

    public addMessage(title: string, text: string, importance: MessagesImportance) {

        let message = {
            title: title,
            text: text,
            importance: importance,
            status: MessageState.New,
            time: moment().format("LT")
        };

        this.messages.push(message);

        this.callNext();
    }

    public markAsDisplayed(m: Message) {
        m.status = MessageState.Displayed;
    }

    public markNewAsDisplayed() {
        this.messages.forEach((m) => {
            if (m.status === MessageState.New) {
                m.status = MessageState.Displayed;
            }
        });

        this.callNext();
    }

    public markDisplayedAsSeen() {
        this.messages.forEach((m) => {
            if (m.status === MessageState.Displayed) {
                m.status = MessageState.Seen;
            }
        });

        this.callNext();
    }

    public callNext() {        
        this.messagesSub.next([].concat(this.messages));
    }
}

export class Message {
    public title: string;
    public text: string;
    public importance: MessagesImportance;
    public status: MessageState;
    public time: string;
}

export enum MessageState { New, Displayed, Seen }

export enum MessagesImportance { Info, Finished, Error }


