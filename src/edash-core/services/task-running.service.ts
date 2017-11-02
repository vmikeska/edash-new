import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class TaskRunningService {

    public taskStateChange = new EventEmitter<TaskEvent>();

    public task(strId: string, started: boolean) {
        this.taskStateChange.emit({strId: strId, started: started});
    }

}

export class TaskEvent {
 public strId: string;
 public started: boolean;
}
