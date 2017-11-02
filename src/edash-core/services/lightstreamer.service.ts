
import { Injectable, OnInit } from "@angular/core";

import { Subject } from "rxjs/Subject";
import { ApiCommService } from "./api-comm.service";
import { ApiKeyService } from "./api-key.service";
import { UserInfoService } from "./user-info.service";
import { SettingsListService } from "./settings-list-service";

declare var Lightstreamer: any;

@Injectable()
export class LightstreamerService {

    constructor(
        private _apiComm: ApiCommService,
        private _apiKeySvc: ApiKeyService,
        private _userSvc: UserInfoService,
        private _settingsListSvc: SettingsListService
    ) {        
        this.connect();
    }

    public connection;

    public status = "";
    public statusChanged = new Subject<string>();

    private reconnectTimer;

    public async reconnectServer() {
        await this._apiKeySvc.refresh();
        let apiKey = this._apiKeySvc.response;
        this.connection.connectionDetails.setPassword(apiKey);
        this.connection.connect();
    }

    public get isServerOnline() {                        
        let isConnected = this.status.substring(0, 9) === "CONNECTED";
        return isConnected;
    }

    private async connect() {
        let apiKey = await this._apiKeySvc.getValueAsync();
        let settingsList = await this._settingsListSvc.getValueAsync();
        let user = await this._userSvc.getValueAsync();

        this.connection = new Lightstreamer.LightstreamerClient(settingsList.pushServer, 'EDASHBOARD');
        this.connection.connectionDetails.setUser(user.username);
        this.connection.connectionDetails.setPassword(apiKey);

        this.connection.connectionSharing.enableSharing('EDASHBOARD', 'ATTACH', 'CREATE');
        this.connection.addListener({
            onStatusChange: (newStatus) => {                
                this.onStatusChange(newStatus);
            }
        });
        this.connection.connect();
    }

    private onStatusChange(newStatus: string) {        
        this.status = newStatus;

        this.statusChanged.next(newStatus);

        switch (newStatus) {
            case 'CONNECTING': break;

            case 'CONNECTED:WS-STREAMING':
            case 'CONNECTED:WS-POLLING':
            case 'CONNECTED:HTTP-POLLING':
                clearInterval(this.reconnectTimer);
                break;

            case 'DISCONNECTED:WILL-RETRY':

                break;

            case 'DISCONNECTED':
                this.reconnectTimer = setInterval(this.reconnectServer(), 5000);
                break;
        }
    }

}