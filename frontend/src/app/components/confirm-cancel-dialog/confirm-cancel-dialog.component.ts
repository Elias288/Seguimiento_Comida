import { Component, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

interface DialogData {
    message: string
}
@Component({
    selector: 'app-confirm-cancel-dialog',
    templateUrl: './confirm-cancel-dialog.component.html',
    styleUrls: ['./confirm-cancel-dialog.component.scss']
})
export class ConfirmCancelDialogComponent {
    constructor (
        public dialogRef: MatDialogRef<ConfirmCancelDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {  }
}
