
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';
import { $ } from '../../common/globals';

@Component({
    selector: 'wizard',
    templateUrl: 'wizard.html'
})

export class WizardComponent implements OnInit {
    constructor() { }


    ngOnInit() {
        if (this.content) {
            this.hideAllContents();
        }

        if (this.activateFirstStep) {
            let firstStep = _.minBy(this.visibleSteps, "no");
            if (firstStep) {
                let firstNo = firstStep.no;

                this.activateTabByNo(firstNo);
                this.activateContentByNo(firstNo);
            }
        }
    }

    @Input()
    public content: HTMLElement;

    @Input()
    public steps: WizardStep[];

    public get visibleSteps() {
        let steps = _.filter(this.steps, (s) => { return !s.hidden });
        return steps;
    }

    @Input()
    public activateFirstStep = true;

    @Output()
    public onStepChange = new EventEmitter<WizardStep>();

    @Input()
    public useNumbers = true;

    public stepClick(step: WizardStep) {
        this.activateTabByNo(step.no);
        this.activateContentByNo(step.no);

        this.onStepChange.next(this.activeStep);
    }

    public moveToNext() {
        let nextNo = this.activeStep.no + 1;
        this.activateTabByNo(nextNo);
        this.activateContentByNo(nextNo);

        this.onStepChange.next(this.activeStep);
    }

    public activeStep: WizardStep;

    public getTabText(step: WizardStep) {
        let txt = "";
        if (this.useNumbers) {
            txt += `${step.no}. `;
        }

        txt += step.name;
        return txt;
    }


    public activateTabByNo(no: number) {
        let step = this.findStepByNo(no);
        step.disabled = false;
        this.activeStep = step;
    }

    private activateContentByNo(no: number) {
        let step = this.findStepByNo(no);

        if (!step.contentClass) {
            return;
        }

        this.hideAllContents();
        let cont = this.getContByClass(step.contentClass);
        cont.classList.remove("hidden");
    }

    private hideAllContents() {
        if (!this.content) { }

        this.steps.forEach((s) => {
            let cont = this.getContByClass(s.contentClass);
            cont.classList.add("hidden");
        })
    }

    private getContByClass(cls: string) {
        let elems = this.content.getElementsByClassName(cls);
        let cont = elems[0];
        return cont;
    }



    public findStepByNo(no: number) {
        let step = _.find(this.steps, { no: no });
        return step;
    }



}

export class WizardStep {
    no: number;
    name: string;
    contentClass?: string;
    hidden?: boolean;
    disabled?: boolean;
}