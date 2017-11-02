import { AppComponent } from "./app.component";
import { AppWin } from "./components/base-window.component";
import { ModalDialogComponent } from "./components/modal-dialog.component";
import { ConfirmDlgComponent } from "./components/confirm-dlg.component";
import { ComboBoxComponent } from "./controls/combo-box.component";
import { CheckboxComponent } from "./controls/checkbox.component";
import { DataTableComponent } from "./controls/data-table.component";
import { FormButtonComponent } from "./controls/form-button.component";
import { InputNumberComponent } from "./controls/input-number.component";
import { ListBoxComponent } from "./controls/list-box.component";
import { ListButtonComponent } from "./controls/list-button.component";
import { ListCheckerComponent } from "./controls/list-checker.component";
import { NumberVerticalComponent } from "./controls/number-vertical.component";
import { RadioButtonsComponent } from "./controls/radio-buttons.component";
import { SwitchComponent } from "./controls/switch.component";
import { TabsComponent } from "./controls/tabs.component";
import { TabsMenuComponent } from "./controls/tabs-menu.component";
import { TimeControlComponent } from "./controls/time-control.component";
import { ValueSliderComponent } from "./controls/value-slider.component";
import { YearPickerComponent } from "./controls/year-picker.component";
import { CalendarModalComponent } from "./controls/calendar/calendar-modal.component";
import { ResizeGridDrawer } from "./dragResize/GridResizing";
import { AppBuildingService } from "./services/app-building.service";
import { SpaceMangerService } from "./dragResize/SpaceMangerService";
import { MdlgCreationService } from "./services/mdlg-creation.service";
import { WinCreationService } from "./services/win-creation.service";
import { DynamicCreationService } from "./services/dynamic-creation.service";
import { WinInstanceService } from "./services/win-instance.service";
import { CalendarDialogComponent } from "./controls/calendar/calendar-dialog.component";
import { WizardComponent } from "./controls/wizard.component";
import { TextareaInputComponent } from "./controls/textarea-input.component";
import { FileDragDropDirective } from "./directives/file-drop-dialog-directive";
import { InputTextComponent } from "./controls/input-text.component";

export const dynamicComponents = [
  ModalDialogComponent,
  ConfirmDlgComponent,
  AppWin,
  CalendarDialogComponent
]

export const components = [
  //desktop
  AppComponent,

  FileDragDropDirective,
  
  //controls
  ComboBoxComponent,
  CheckboxComponent,
  DataTableComponent,
  FormButtonComponent,
  InputNumberComponent,
  ListBoxComponent,
  ListButtonComponent,
  ListCheckerComponent,
  NumberVerticalComponent,
  RadioButtonsComponent,
  SwitchComponent,
  TabsComponent,
  TabsMenuComponent,
  TimeControlComponent,
  ValueSliderComponent,
  YearPickerComponent,
  CalendarModalComponent,
  WizardComponent,
  TextareaInputComponent,
  InputTextComponent


];


export const services = [
  ResizeGridDrawer,
  AppBuildingService,
  SpaceMangerService,
  MdlgCreationService,
  WinCreationService,
  DynamicCreationService,
  WinInstanceService,

];