import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuService } from 'src/app/services/menu/menu.service';

@Component({
    selector: 'app-menu-dialog',
    templateUrl: './menu-dialog.component.html',
    styleUrls: ['./menu-dialog.component.scss']
})
export class MenuDialogComponent implements OnInit {
    menuData!: FormGroup

    constructor(
        public dialogRef: MatDialogRef<MenuDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private menuService: MenuService,
        private authService: AuthService,
        private _snackBar: MatSnackBar,
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

    public deleteMenu(menuId: string) {
        this.menuService.deleteMenu(menuId, this.authService.token).subscribe({
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
}
