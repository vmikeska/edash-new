
import { Component } from '@angular/core';
import { ButtonItem } from '../../../desktop/controls/list-button.component';


@Component({
  selector: 'dash-desktop-setting',
  templateUrl: './dash-desktop-setting.html'  
})

export class DashDesktopSettingComponent {

    public lstButtons: ButtonItem[] = [{ ico: "icon-bookmark", action: "SAVE", caption: "save" }];

    public list: Layout[] = [
        {id: 1, name: "Office"},
        {id: 2, name: "Home"},
        {id: 3, name: "Notebook"},
        {id: 4, name: "IPad"}
    ];

    public buttonClicked(e) {

    }

}

export class Layout {
    public id: number;
    public name: string;
}