import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuService } from 'src/app/services/menu/menu.service';
import { Menu } from 'src/app/utils/menu.inteface';
import { ConfirmCancelDialogComponent } from '../confirm-cancel-dialog/confirm-cancel-dialog.component';

@Component({
    selector: 'app-menu-dialog',
    templateUrl: './menu-dialog.component.html',
    styleUrls: ['./menu-dialog.component.scss'],
    providers: [ConfirmationService]
})
export class MenuDialogComponent implements OnInit {
    menuData!: FormGroup

    constructor(
        public dialogRef: MatDialogRef<MenuDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private menuService: MenuService,
        private authService: AuthService,
        private _snackBar: MatSnackBar,
        public dialog: MatDialog,
    ) {  }

    ngOnInit(): void {
        this.menuData = new FormGroup ({
            menuPrincipal: new FormControl<string>(this.data.day.menu.menuPrincipal, [
                Validators.required,
                Validators.minLength(3),
            ]),
            menuSecundario: new FormControl<string>(this.data.day.menu.menuSecundario, []),
            date: new FormControl(this.data.completeDate, [
                Validators.required,
            ])
        })
    }

    public deleteMenu() {
        const message = "¿Seguro que quiere elminar este menu?"
        const dialogref = this.openConfirmCancelDialog(message)
        dialogref.afterClosed().subscribe(result => {
            if (result) {
                this.menuService.deleteMenu(this.data.day.menu._id, this.authService.token).subscribe({
                    next:(v: any) => {
                        this._snackBar.open(v.message, 'close', { duration: 5000 })
                    },
                    error: (e) => {
                        this._snackBar.open(e.error.message, 'close', { duration: 5000 })
                        this.dialogRef.close()
                    },
                    complete: () => {
                        this.dialogRef.close()
                    }
                })
            }
        })
    }

    public updateMenu() {
        const message = "¿Seguro que quiere actualizar este menu?"
        const dialogref = this.openConfirmCancelDialog(message)
        dialogref.afterClosed().subscribe(result => {
            if (result) {
                const menu: Menu = { _id: this.data.day.menu._id, ...this.menuData.value }
                
                this.menuService.updateMenu(this.authService.token, menu).subscribe({
                    next:(v: any) => {
                        this._snackBar.open(v.message, 'close', { duration: 5000 })
                    },
                    error: (e) => {
                        this._snackBar.open(e.error.message, 'close', { duration: 5000 })
                        this.dialogRef.close()
                    },
                    complete: () => {
                        this.dialogRef.close()
                    }
                })
            }
        })
    }

    private openConfirmCancelDialog(message: string){
        return this.dialog.open(ConfirmCancelDialogComponent, {
            data: { message }
        })
    }
}
