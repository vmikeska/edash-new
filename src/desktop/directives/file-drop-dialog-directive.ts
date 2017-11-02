import { Directive, HostListener, HostBinding, EventEmitter, Output, Input, ElementRef } from '@angular/core';
import { $ } from '../../common/globals';
import { DelayedReturn } from '../../common/DelayedReturn';

@Directive({
  selector: '[fileDragDrop]'
})
export class FileDragDropDirective {


  constructor(private element: ElementRef) {
    this.initLeaveDelayed();
  }

  @Input()
  public allowedExtensions: Array<string> = [];

  @Input()
  public hoverClass = "hovered";

  @Output()
  private filesChangeEmiter: EventEmitter<File[]> = new EventEmitter();

  @Output()
  private filesInvalidEmiter: EventEmitter<File[]> = new EventEmitter();

  private leaveDelayedReturn: DelayedReturn;

  private initLeaveDelayed() {
    this.leaveDelayedReturn = new DelayedReturn(100);
    this.leaveDelayedReturn.callback = () => {
      this.elem.classList.remove(this.hoverClass);      
    }
  }

  private get elem() {
    let elem = <HTMLElement>this.element.nativeElement;
    return elem;
  }

  @HostListener('dragenter', ['$event'])
  public onDragEnter(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    this.elem.classList.add(this.hoverClass);
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    this.leaveDelayedReturn.call();
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    this.leaveDelayedReturn.call();
  }

  @HostListener('drop', ['$event'])
  public onDrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();


    let files = <FileList>evt.dataTransfer.files;

    let validFiles: Array<File> = [];
    let invalidFiles: Array<File> = [];

    if (files.length > 0) {

      for (let act = 0; act <= files.length - 1; act++) {
        let file = files[act];
        let ext = file.name.split('.')[file.name.split('.').length - 1];
        if (this.allowedExtensions.lastIndexOf(ext) != -1) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file);
        }
      }

      this.filesChangeEmiter.emit(validFiles);
      this.filesInvalidEmiter.emit(invalidFiles);
    }
  }

}