import {Observable, empty} from "rxjs";

import {filter, take, takeUntil, tap} from "rxjs/operators";
import {Component, ComponentRef, EventEmitter, Inject, OnDestroy, ViewChild, ViewContainerRef} from "@angular/core";

import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import {IDialog, IDialogAction} from "./dialog-manager.service";
import {ESCAPE} from "@angular/cdk/keycodes";
import { NzI18nService } from "@gs/ng-horizon/i18n";

export interface IDialogComponentData {
    componentData?: any;
    title?: string;
    colors?: any[];
    buttons?: any[];
}

@Component({
    template: `
    <mat-card class="gs-dialog gs-dialog-host" (keyup)="onKeyup($event)">
      <mat-card-title>
        <span [innerHtml]="data.title"></span>
        <button mat-icon-button [disabled]="intentOn" (click)="close($event)"><mat-icon class="gs-dialog__close">close</mat-icon></button>
      </mat-card-title>
      <mat-card-content>
        <span #content></span>
      </mat-card-content>
      <mat-card-actions>
          <button
              [disabled]="item.disabled || intentOn"
              mat-button
              [ngClass]="item.class || data.buttons[i]"
              [color]="item.color || data.colors[i]"
              *ngFor="let item of actions; let i=index;"
              (click)="onAction(item)"
              [tabindex]="i+1" cdkFocusInitial>
            {{item.label}}</button>
      </mat-card-actions>
    </mat-card>
    `,
  styleUrls: ["./dialog.component.scss"]
})
export class DialogHostComponent<T extends IDialog> implements OnDestroy/*, OnInit, AfterContentInit*/ {

    //{360.admin.network_access.save}=SAVE
    //{360.admin.network_access.cancel}=CANCEL
    @ViewChild("content", { read: ViewContainerRef, static: true })
    content: ViewContainerRef;
    componentRef: ComponentRef<T>;
    intentOn = false;
    actions: IDialogAction[] = [ { label: this.i18nService.translate('360.admin.network_access.save')}, {label: this.i18nService.translate('360.admin.network_access.cancel')}];
    updates: EventEmitter<any>;

    constructor( @Inject(MAT_DIALOG_DATA) public data: IDialogComponentData,private i18nService: NzI18nService,
    private _dialogRef: MatDialogRef<DialogHostComponent<T>>) { }
    create(component): Observable<any> {
        this.componentRef = this.content.createComponent<T>(component);
        this.actions = this.componentRef.instance.actions
                                ? [...this.componentRef.instance.actions]
                                : this.actions;

        if (typeof this.componentRef.instance.updateData === "function") {
            this.componentRef.instance.updateData.apply(this.componentRef.instance, [this.data.componentData]);
        }

        // NOTE: IS THERE A BETTER DESIGN?
        const obs: Observable<any> = this.componentRef.instance.notifier || empty();
        return obs.pipe(tap((val) => {
                if (val.type === "CLOSE") {
                    this.close();
                } else if (val.type === "INTENT_ON") {
                    this.intentOn = true;
                } else if (val.type === "INTENT_OFF") {
                    this.intentOn = false;
                } else if (val.type === "ACTIONS") {
                    this.actions = val.value;
                } else if (val.type === "TITLE_UPDATE") {
                    this.data = { ...this.data, title: val.value };
                }}),
            takeUntil(this._dialogRef.afterClosed()),
            filter(v => ["ACTIONS", "INTENT_ON", "INTENT_OFF", "TITLE_UPDATE"].indexOf(v.type) === -1));
    }

    onAction(item) {

        this.intentOn = true;
        const status = this.componentRef.instance.execute(item);

        if (typeof status === "boolean") {
            if (status) {
                this.intentOn = false;
                this._dialogRef.close(item.value || item.label);
            } else {
                // TODO: think more on this block..
                this.intentOn = false;
            }
        } else if (status instanceof Promise) {
            status.then(() => {
                this.intentOn = false;
                this._dialogRef.close(item.value || item.label);
            }).catch(() => {
                this.intentOn = false;
            });
        } else if (status instanceof Observable) {
            status.pipe(
                take(1))
                .subscribe((yes) => {
                    this.intentOn = false;
                    if (yes) {
                        this._dialogRef.close(item.value || item.label);
                    }
                });
        }

    }

    ngOnDestroy(): void {
        console.info("DialogHost destroyed..");
        this.componentRef = null;
    }

    onKeyup(evt: KeyboardEvent) {
        if (evt.keyCode === ESCAPE) {
            this._dialogRef.close("ESCAPE");
        }
    }

    close(evt?) {
        this._dialogRef.close("CLOSE");
    }


}
