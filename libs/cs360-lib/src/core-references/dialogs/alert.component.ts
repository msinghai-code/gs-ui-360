import {Component, Inject} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {ESCAPE} from "@angular/cdk/keycodes";

@Component({
    template: `
    <mat-card class="gs-dialog gs-alert" (keyup)="onKeyup($event)">
      <mat-card-content>
        <span [innerHTML]="data.message"></span>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button class="mat-raised-button" [color]="data.colors[0]" [mat-dialog-close]="'OK'" tabindex="1">Ok</button>
      </mat-card-actions>
    </mat-card>
    `,
  styleUrls: ["./dialog.component.scss"]
})
export class AlertComponent {
    constructor( @Inject(MAT_DIALOG_DATA) public data: any, private _dialogRef: MatDialogRef<AlertComponent>) { }
    onKeyup(evt: KeyboardEvent) {
        if (evt.keyCode === ESCAPE) {
            this._dialogRef.close("escape");
        }
    }
}

