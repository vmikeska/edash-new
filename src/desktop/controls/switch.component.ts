

import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: 'switch',
  templateUrl: './switch.html',
})

export class SwitchComponent {

    private act;

    @Input()
    public set active(val) {
        this.act = val;        
        this.resetText();
    } 

    public get active() {
        return this.act;
    }

    @Output()
    public valueChanged = new EventEmitter<number>();

    public text = "";

    public switchClicked() {
        this.active = !this.active;
        this.valueChanged.emit(this.active)
        this.resetText();
    }

    private resetText() {
        this.text = this.active ? "ON" : "OFF";
    }
}