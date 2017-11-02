import { Type } from "@angular/core";
import { DashboardComponent } from "../edash-core/plugins/dashboard/dashboard.component";


export class PluginsConfig {
    public static plugins: Type<any>[] = [DashboardComponent];
}