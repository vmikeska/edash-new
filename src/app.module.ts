// core modules don't remove
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from "@angular/core";
import { HttpModule } from "@angular/http";
// core modules don't remove

import * as desktop from "./desktop/desktop.module";
import * as custom from "./custom/apps/custom-apps.module"
import * as coreApps from "./edash-core/apps/core-apps.module"
import * as corePlugins from './edash-core/plugins/core-plugins.module'
import * as coreServices from "./edash-core/services/core-services.module"
import { AppComponent } from './desktop/app.component';
import { AppsFactoryService } from './config/apps-factory-service';
import { TestBtnService } from './edash-core/plugins/dashboard/test-btn.service';
import { StandbyService } from './config/standby.service';


@NgModule({
  declarations:  [
    desktop.components,
    desktop.dynamicComponents,
    coreApps.components,
    coreApps.dynamicComponents,
    custom.components,
    custom.dynamicComponents,
    corePlugins.components,
    corePlugins.dynamicComponents
  ],

  entryComponents: [
    desktop.dynamicComponents,
    coreApps.dynamicComponents,
    custom.dynamicComponents,
    corePlugins.dynamicComponents
  ],
  providers: [
    AppsFactoryService,
    StandbyService,
    desktop.services,
    coreApps.services,
    coreApps.factories,
    coreServices.services,
    //test
    TestBtnService
  ],

  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
  ],

  bootstrap: [AppComponent],


})

export class AppModule {

  constructor(private _standbySvc: StandbyService) {

  }

}


