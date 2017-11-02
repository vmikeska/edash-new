
import { Component } from '@angular/core';
import { TabItem } from '../../../desktop/controls/tabs.component';

@Component({
  selector: 'dash-setting',
  templateUrl: './dash-settings.html'
})

export class DashSettingsComponent {

  public tabs: TabItem[] = [
    { id: "hsSound", name: "Sound" },
    { id: "hsUserData", name: "User data" },
    { id: "hsPassword", name: "Password" },
  ];


  public soundActive = true;

  public defaultVolume = 8;

  public volumeOnOffChanged(isOn) {
    this.soundActive = isOn;
  }

  public volumeChanged(newVol) {
    console.log("saving: " + newVol);
  }

}

