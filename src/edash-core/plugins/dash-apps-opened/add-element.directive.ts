
import { Directive, OnInit, OnDestroy, Input, ElementRef } from "@angular/core";

@Directive({
  selector: '[addElement]'
})
export class AddElementDirective implements OnInit, OnDestroy {
  @Input('addElement') obj: any;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.el.nativeElement.appendChild(this.obj);
  }

  ngOnDestroy() {
    this.obj.nativeElement = null;
  }
}