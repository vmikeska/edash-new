import { Component, Input, OnInit } from '@angular/core';



@Component({
  selector: 'year-picker',
  templateUrl: './year-picker.html',
})

export class YearPickerComponent implements OnInit {
  ngOnInit(): void {
    
    
    for(let act = this.iFrom; act <= this.iTo; act++){
      this.years.push(act);
    }

  }

  @Input()
  public from;

  public get iFrom() {
    return parseInt(this.from);
  }

  @Input()
  public to;

  public get iTo() {
    return parseInt(this.to);
  }

  public years: number[] = [];

  public isVisible = false;

  public btnClicked() {
    this.isVisible = !this.isVisible;
  }

  public yearClicked(year) {

   this.isVisible = false; 
  }

}
