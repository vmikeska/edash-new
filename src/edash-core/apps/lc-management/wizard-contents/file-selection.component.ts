

import { Component, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'file-selection',
    templateUrl: 'file-selection.html'
})

export class FileSelectionComponent {
    constructor() { }

    private fileList: any = [];
    private invalidFiles: any = [];

    @Output()
    public onFileSelected = new EventEmitter<File>();

    public allowedExtensions = ['csv','xls','xlsx'];

    public onFilesLoaded(e) {
        this.fileList = e.target.files;
        //todo: make also check on allowed types
        let file = this.fileList[0];
        this.onFileSelected.emit(file);
    }

    public onFilesChange(fileList: Array<File>) {                
        this.fileList = fileList;
        let file = this.fileList[0];
        this.onFileSelected.emit(file);
    }

    public onFileInvalids(fileList: Array<File>) {        
        this.invalidFiles = fileList;
    }
}