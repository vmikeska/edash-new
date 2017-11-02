import { DashboardComponent } from "../plugins/dashboard/dashboard.component";
import { DashAppsMenuComponent } from "../plugins/dash-apps-menu/dash-apps-menu.component";
import { DashNotificationsComponent } from "../plugins/dash-notifications/dash-notifications.component";
import { DashDesktopSettingComponent } from "../plugins/dash-desktop-setting/dash-desktop-setting.component";
import { DashSettingsComponent } from "../plugins/dash-settings/dash-settings.component";
import { DashUserInfoComponent } from "../plugins/dash-user-info/dash-user-info.component";
import { DashAppsOpenedComponent } from "../plugins/dash-apps-opened/dash-apps-opened.component";
import { DashConnectionIndicatorComponent } from "../plugins/dash-connection-indicator/dash-connection-indicator.component";
import { AddElementDirective } from "../plugins/dash-apps-opened/add-element.directive";

export const dynamicComponents = [
    //dashboard
    DashboardComponent,
    DashAppsMenuComponent,
    DashNotificationsComponent,
    DashDesktopSettingComponent,
    DashSettingsComponent,
    DashUserInfoComponent,
    DashAppsOpenedComponent,

    DashConnectionIndicatorComponent,
]

export const components = [
    AddElementDirective,
];