
import * as _ from "lodash";
import { ViewChild, ElementRef, Input, AfterViewInit, OnInit, Output, EventEmitter } from "@angular/core";
import { ControlsForm } from "./ControlsForm";
import { Utils } from "../../common/Utils";
import { ControlsValidator } from "./control-validator";


export class FormControl implements OnInit, AfterViewInit {

    //init cycle

    public ngAfterViewInit() { }

    public ngOnInit() {
        if (this.hasForm) {
            this.form.addToForm(this);
        }

        this.initKeyDownEventHandler();

        this.onInit();
    }

    protected onInit() { }

    constructor(public _elem: ElementRef) {

    }

    @Input()
    public validator: ControlsValidator;

    //init cycle


    //optional limit settings
    @Input()
    public minValue? = null;

    @Input()
    public maxValue? = null;

    @Input()
    public maxLength? = null;

    //optional limit settings

    //form stuff

    @ViewChild("focusable")
    public focusableElement;

    @Input()
    public form: ControlsForm;

    @Input()
    public name: string;

    @Input()
    public formTabIndex: number;

    public tabindex = -1;

    public hasFocus = false;

    public exportableValue = true;

    protected get hasForm() {
        return !Utils.isNullOrUndefined(this.form);
    }

    public formValueChange() {
        this.onChange.emit(this.formValue)

        if (this.hasForm) {
            this.form.valueChanged(this);
        }
    }

    //form stuff

    //value stuff

    
    @Output()
    public onChange = new EventEmitter<any>();

    @Input()
    public set defaultValue(value) {
        //todo: impement overall
    }

    public get formValue() {
        //todo: implement overall
        return null;
    }

    public setValue(value, emitChange = true) {
        //todo: implement overall
    }

    //value stuff

    //enabled stuff
    private enabledInternal = true;

    @Input()
    public set enabled(val: boolean) {
        this.changeEnabled(val);
    }

    public get enabled() {
        return this.enabledInternal;
    }

    public changeEnabled(enabled: boolean) {
        this.enabledInternal = enabled;

        if (enabled) {
            this.tabindex = this.formTabIndex;
        } else {
            this.tabindex = -1;
        }
    }

    //enabled stuff


    //keyboard stuff

    private initKeyDownEventHandler() {

        if (!this.hasForm) {

            if (this.focusableElement) {
                this.focusableElement.nativeElement.onkeydown = (e) => {
                    this.onKeyDown(e);
                };
            }

            return;
        }

        this.focusableElement.nativeElement.onkeydown = (e) => {

            if (e.code === "Tab") {

                if (!e.shiftKey) {
                    if (this.formTabIndex === this.form.maxIndex) {
                        e.preventDefault();
                        this.form.activateFirstControl();
                    }
                }

            } else {
                this.onKeyDown(e);
            }
        };

    }

    protected onKeyDown(e) {

    }

    //keyboard stuff


    protected get fontSize() {
        let size = Utils.getFontSize(this._elem.nativeElement);
        return size;
    }

    



}







