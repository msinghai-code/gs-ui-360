import {Component, Inject} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {ESCAPE} from "@angular/cdk/keycodes";

@Component({
    template: `
    <mat-card class="gs-dialog gs-confirm" (keyup)="onKeyup($event)">
      <mat-card-content>
            <span [innerHTML]="data.message"></span>
        </mat-card-content>
        <mat-card-actions>
            <button
                mat-button
                [ngClass]="data.buttons[i]"
                [color]="data.colors[i]"
                *ngFor="let val of data.options; let i=index;"
                [mat-dialog-close]="val"
                [tabindex]="i+1">{{val}}</button>
        </mat-card-actions>
    </mat-card>
    `,
  styleUrls: ["./dialog.component.scss"]
})
export class ConfirmComponent {
    constructor( @Inject(MAT_DIALOG_DATA) public data: any, private _dialogRef: MatDialogRef<ConfirmComponent>) { }
    onKeyup(evt: KeyboardEvent) {
        if (evt.keyCode === ESCAPE) {
            this._dialogRef.close("escape");
        }
    }
}
