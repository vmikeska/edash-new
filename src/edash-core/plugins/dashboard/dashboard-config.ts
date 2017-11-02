import { DashAppsMenuComponent } from "../dash-apps-menu/dash-apps-menu.component";
import { DashNotificationsComponent } from "../dash-notifications/dash-notifications.component";
import { DashDesktopSettingComponent } from "../dash-desktop-setting/dash-desktop-setting.component";
import { DashSettingsComponent } from "../dash-settings/dash-settings.component";
import { DashUserInfoComponent } from "../dash-user-info/dash-user-info.component";
import { DashAppsOpenedComponent } from "../dash-apps-opened/dash-apps-opened.component";
import { DashboardMenuItem } from "./dashboard.component";


export class DashboardConfig {
    
    public static menuItems: DashboardMenuItem[] = [
        { type: DashAppsMenuComponent, title: "applications menu", icon: "icon-browser" },
        { type: DashNotificationsComponent, title: "notifications", icon: "icon-bell-o" },
        { type: DashDesktopSettingComponent, title: "desktop setting", icon: "icon-monitor" },
        { type: DashSettingsComponent, title: "application settings", icon: "icon-cog" },
        { type: DashUserInfoComponent, title: "user info", icon: "icon-user" },
        { type: DashAppsOpenedComponent, title: "opened applications", icon: "icon-windows" },
    ];


}