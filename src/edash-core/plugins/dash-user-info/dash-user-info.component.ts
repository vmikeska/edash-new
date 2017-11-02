
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { UserInfoService } from '../../services/user-info.service';


@Component({
  selector: 'dash-user-info',
  templateUrl: './dash-user-info.html'
})

export class DashUserInfoComponent implements OnInit {

  async ngOnInit() {
    await this.buildStrings();
  }

  constructor(private _userInfoSvc: UserInfoService) {

  }

  private async buildStrings() {
    let u = await this._userInfoSvc.getValueAsync();

    this.user = `${u.firstName} ${u.lastName}`;
    this.company = u.company.name;
    
    let md = moment(u.lastLogin, "YYYY-MM-DD hh:mm:ss");    
    this.online = md.format("lll");    
  }

  public user: string;
  public company: string;
  public online: string;

}
