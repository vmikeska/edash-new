import { UserInfoService } from "./user-info.service";
import { ApiCommService } from "./api-comm.service";
import { NotificationService } from "./notification.service";
import { ApiKeyService } from "./api-key.service";
import { SettingsListService } from "./settings-list-service";
import { LightstreamerService } from "./lightstreamer.service";
import { TradableInstrumentsService } from "./tradable-instruments.service";
import { OtcInstrumentsService } from "./otc-instruments.service";
import { PermissionService } from "./permission.service";
import { MenuListService } from "./menu-list-service";
import { TaskRunningService } from "./task-running.service";
import { AlertSubscriptionService } from "./alert-subscription.service";


export const services = [
  UserInfoService,
  ApiCommService,
  NotificationService,
  ApiKeyService,
  SettingsListService,
  LightstreamerService,
  TradableInstrumentsService,
  OtcInstrumentsService,
  PermissionService,
  MenuListService,
  TaskRunningService,
  AlertSubscriptionService
]