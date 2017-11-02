import { InstrumentSelectionComponent } from "./instrument-selection/instrument-selection.component";
import { QuotePageConfigComponent } from "./quote-page/quote-page-config.component";
import { OrdersActiveTableComponent } from "./orders/orders-active-table.component";
import { OrdersInactiveTableComponent } from "./orders/orders-inactive-table.component";
import { OrderEditDlgComponent } from "./orders/order-edit.component";
import { SellFormComponent } from "./quote-page/sell-form.component";
import { NewConfigDialogComponent } from "./quote-page/new-config-dialog.component";
import { ExternalTransactionDlgComponent } from "./orders/external-transaction-dlg.component";
import { QuotePageComponent } from "./quote-page/quote-page.component";
import { EodDataComponent } from "./eod-data/eod-data.compoment";
import { HistoryChartComponent } from "./history-chart/history-chart.component";
import { MarketNewsComponent } from "./market-news/market-news.component";
import { OrdersComponent } from "./orders/orders.component";
import { PortfolioComponent } from "./portfolio-news/portfolio.component";
import { RealTimeChartComponent } from "./realtime-chart/real-time-chart.component";
import { QuotePageConfigService } from "./quote-page/quote-page-configs.service";
import { QuotePageSubscriptionService } from "./quote-page/quote-page-subscription.service";
import { RtChartSubscriptionService } from "./realtime-chart/rt-chart-subscription.service";
import { OrdersSubscriptionService } from "./orders/orders-subscription.service";
import { OrdersDataService } from "./orders/orders-data.service";
import { QuotePageFactoryService } from "./quote-page/quote-page-factory.service";
import { HistoryChartFactoryService } from "./history-chart/history-chart-factory.service";
import { RealTimeChartFactoryService } from "./realtime-chart/real-time-chart-factory.service";
import { OrdersFactoryService } from "./orders/orders-factory.service";
import { MarketNewsFactoryService } from "./market-news/market-news-factory.service";
import { EodFactoryService } from "./eod-data/eod-factory.service";
import { OrdersService } from "../services/orders.service";
import { StockChartComponent } from "../highcharts/stock-chart.component";
import { AlertsComponent } from "./alerts/alerts.compoment";
import { AlertsFactoryService } from "./alerts/alerts-factory.service";
import { AlertsDataService } from "../services/alerts-data.service";
import { AlertDetailDialogComponent } from "./alerts/alert-detail-dialog.component";
import { TickDataService } from "./alerts/tick-data.service";
import { AlertPopupComponent } from "./alerts/alert-popup.component";
import { LcManagementFactoryService } from "./lc-management/lc-management-factory.service";
import { LcManagementComponent } from "./lc-management/lc-management.component";
import { LcMgmtDataService } from "./lc-management/lc-mgmt-data.service";
import { LcWizardComponent } from "./lc-management/lc-wizard-dlg.component";
import { TypeSelectionContentComponent } from "./lc-management/wizard-contents/type-selection-content.component";
import { LcFileService } from "./lc-management/lc-file.service";
import { FileSelectionComponent } from "./lc-management/wizard-contents/file-selection.component";
import { StandardFileUploadContentComponent } from "./lc-management/wizard-contents/standard-file-upload-content.component";
import { FinalSaveContentComponent } from "./lc-management/wizard-contents/final-save-content.component";
import { CustomerClusterService } from "./lc-management/customer-cluster.service";
import { ParseValuesContentComponent } from "./lc-management/wizard-contents/parse-values-content.component";
import { CustomFileUploadContentComponent } from "./lc-management/wizard-contents/custom-file-upload-content.component";
import { AnalyseContentComponent } from "./lc-management/wizard-contents/analyse-content.component";
import { AnalyseReportComponent } from "./lc-management/wizard-contents/analyse-report.component";
import { TextContentComponent } from "./lc-management/wizard-contents/text-content.component";
import { LcEditDlgComponent } from "./lc-management/lc-edit-dlg.component";
import { LcDownloadDlgComponent } from "./lc-management/lc-download-dlg.component";
import { ControlsFormComponent } from "./test/controls-form.component";
import { ControlsFormFactoryService } from "./test/controls-form-factory.service";

export const dynamicComponents = [
    QuotePageComponent,
    EodDataComponent,
    HistoryChartComponent,
    MarketNewsComponent,
    OrdersComponent,
    PortfolioComponent,
    RealTimeChartComponent,
    AlertsComponent,
    LcManagementComponent,

    OrderEditDlgComponent,
    SellFormComponent,
    NewConfigDialogComponent,
    ExternalTransactionDlgComponent,
    AlertDetailDialogComponent,
    AlertPopupComponent,
    
    LcWizardComponent,
    LcEditDlgComponent,
    LcDownloadDlgComponent,

    ControlsFormComponent
    

]

export const components = [
    InstrumentSelectionComponent,
    QuotePageConfigComponent,
    OrdersActiveTableComponent,
    OrdersInactiveTableComponent,

    FileSelectionComponent,
    StandardFileUploadContentComponent,
    TypeSelectionContentComponent,
    FinalSaveContentComponent,
    ParseValuesContentComponent,
    CustomFileUploadContentComponent,
    AnalyseContentComponent,
    AnalyseReportComponent,
    TextContentComponent,

    //highcharts
    StockChartComponent,
]

export const services = [
    QuotePageConfigService,
    QuotePageSubscriptionService,
    OrdersService,    
    RtChartSubscriptionService,
    OrdersSubscriptionService,
    OrdersDataService,
    AlertsDataService,
    TickDataService,
    LcMgmtDataService,
    LcFileService,
    CustomerClusterService
]

export const factories = [
    QuotePageFactoryService,
    RealTimeChartFactoryService,
    HistoryChartFactoryService,
    MarketNewsFactoryService,
    OrdersFactoryService,
    EodFactoryService,
    AlertsFactoryService,
    LcManagementFactoryService,
    ControlsFormFactoryService
]