import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuService } from 'src/app/services/menu/menu.service';
import { SocketIoService } from 'src/app/services/socket-io/socket-io.service';
import { Menu } from 'src/app/utils/menu.inteface';

@Component({
    selector: 'app-create-menu-dialog',
    templateUrl: './create-menu-dialog.component.html',
    styleUrls: ['./create-menu-dialog.component.scss']
})
export class CreateMenuDialogComponent implements OnInit {
    menuData!: FormGroup
    fecha!: Date

    constructor (
        public dialogRef: MatDialogRef<CreateMenuDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private menuService: MenuService,
        private authService: AuthService,
        private _snackBar: MatSnackBar,
        public socketIoService: SocketIoService,
    ) {
        if (data.date != 0) this.fecha = new Date(parseInt(data.date as string, 10))

        this.socketIoService.onNewMenu(()=> {
            this._snackBar.open('Menu creado exitosamente', 'close', { duration: 5000 }),
            this.dialogRef.close(true)
        })
    }

    ngOnInit(): void {
        this.menuData = new FormGroup ({
            menuPrincipal: new FormControl<string>("", [
                Validators.required,
                Validators.minLength(3),
            ]),
            menuSecundario: new FormControl<string>("", []),
            date: new FormControl(this.fecha, [
                Validators.required,
            ])
        })
    }

    onSubmit(): void {
        const { menuPrincipal, menuSecundario, date } = this.menuData.value
        const menu: Menu = { _id: '', menuPrincipal, menuSecundario, date, users: undefined }
        
        if (this.menuData.invalid) {
            this.menuData.markAllAsTouched()
        } else {
            this.socketIoService.newMenu(`Bearer ${this.authService.token}`, menu)
        }
    }
}
