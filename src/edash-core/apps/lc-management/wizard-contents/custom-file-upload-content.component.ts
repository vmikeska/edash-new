
import { Component } from '@angular/core';
import { WizardConentBase } from './wizard-content-base';
import { LcFileService} from '../lc-file.service';


@Component({
    selector: 'custom-file-upload-content',
    templateUrl: 'custom-file-upload-content.html'
})

export class CustomFileUploadContentComponent extends WizardConentBase<File> {
    constructor(private _fileSvc: LcFileService) { 
        super();
    }

    public async onFileSelected(file: File) {                
        this.onFinished.next(file);
    }

}