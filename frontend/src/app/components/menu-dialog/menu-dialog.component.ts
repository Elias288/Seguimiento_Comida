import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuService } from 'src/app/services/menu/menu.service';
import { UserService } from 'src/app/services/user/user.service';
import { Menu } from 'src/app/utils/menu.inteface';
import { User } from 'src/app/utils/user.interface';
import { ConfirmCancelDialogComponent } from '../confirm-cancel-dialog/confirm-cancel-dialog.component';

@Component({
    selector: 'app-menu-dialog',
    templateUrl: './menu-dialog.component.html',
    styleUrls: ['./menu-dialog.component.scss'],
    providers: []
})
export class MenuDialogComponent implements OnInit {
    day!: any                           // TODA LA INFORMACIÓN DEL DIA
    menu!: Menu                         // TODA LA INFORMACIÓN DEL MENU
    completeDate!: Date                 // FECHA COMPLETA DEL MENU
    roles!: Array<string>               // ROL DEL USUARIO LOGUEADO
    hasRoles: boolean = false
    myId!: string                       // ID DEL USUARIO LOGUEADO
    usersInMenu!: Array<User>           // USUARIOS EN EL MENU
    mySelection!: string | undefined    // SI EL USUARIO YA ESTÁ EN EL MENU, CUAL MENU ESTÁ SELECCIONADO
    dataSource = [
        { MP: 0, MS: 0, total: 0 }
    ]

    menuData!: FormGroup 
    matButtonToggleGroup!: any 

    displayedColumns: Array<string> = [ 'menu_principal', 'menu_secundario', 'total' ]

    constructor(
        public dialogRef: MatDialogRef<MenuDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private menuService: MenuService,
        private userService: UserService,
        private authService: AuthService,
        private _snackBar: MatSnackBar,
        public dialog: MatDialog,
    ) {  }

    ngOnInit(): void {
        this.day = this.data.day
        this.menu = this.day.menu
        this.completeDate = this.data.completeDate
        this.roles = this.data.roles
        this.hasRoles = this.data.roles.includes('ADMIN') || this.data.roles.includes('COCINERO')
        if (this.menu.users) {
            this.usersInMenu = this.menu.users
            this.dataSource = [{ 
                MP: this.menu.users.filter(user => user.Menu_User?.selectedMenu == 'MP').length,
                MS: this.menu.users.filter(user => user.Menu_User?.selectedMenu == 'MS').length,
                total: this.menu.users.length,
            }]
        }

        this.authService.getUser().subscribe({
            next: (v) => {
                this.myId = v._id
                this.mySelection = this.menu.users?.length == 0 || !this.menu.users?.find(user => user._id == this.myId) 
                    ? undefined 
                    : this.usersInMenu.find(user => user._id == this.myId)?.Menu_User?.selectedMenu
            },
            error: (e) => console.error(e)
        })

        this.menuData = new FormGroup ({
            menuPrincipal: new FormControl<string>(this.menu.menuPrincipal, [
                Validators.required,
                Validators.minLength(3),
            ]),
            menuSecundario: new FormControl<string>(this.menu.menuSecundario),
            date: new FormControl(this.completeDate, [
                Validators.required,
            ])
        })
    }

    get menuPrincipal() {
        return this.menuData.get('menuPrincipal')
    }

    get menuSecundario() {
        return this.menuData.get('menuSecundario')
    }

    get date() {
        return this.menuData.get('date')
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
                        this.dialogRef.close(false)
                    },
                    complete: () => {
                        this.dialogRef.close(true)
                    }
                })
            }
        })
    }

    public updateMenu() {
        this.openConfirmCancelDialog("¿Seguro que quiere actualizar este menu?")
        .afterClosed().subscribe(result => {
            if (result) {
                const menu: Menu = { _id: this.data.day.menu._id, ...this.menuData.value }
                
                this.menuService.updateMenu(this.authService.token, menu).subscribe({
                    next:(v: any) => {
                        this._snackBar.open(v.message, 'close', { duration: 5000 })
                    },
                    error: (e) => {
                        this._snackBar.open(e.error.message, 'close', { duration: 5000 })
                        this.dialogRef.close(false)
                    },
                    complete: () => {
                        this.dialogRef.close(true)
                    }
                })
            }
        })
    }

    public addtoMenu(value: string) {
        this.openConfirmCancelDialog('Agregarse al menu?')
        .afterClosed().subscribe(result => {
            if (result) {
                this.userService.addToMenu(this.authService.token, this.menu._id, value).subscribe({
                    next: (v: any) => this._snackBar.open(v.message, 'close', { duration: 5000 }),
                    error: (e) => this._snackBar.open(e.error.message, 'close', { duration: 5000 }),
                    complete: () => this.dialogRef.close(true)
                })
            }
        })
    }

    public deleteToMenu(menuId: string) {
        this.openConfirmCancelDialog('Seguro que se quiere dar de baja del menu?')
        .afterClosed().subscribe(result => {
            if (result) {
                this.userService.removeToMenu(this.authService.token, menuId).subscribe({
                    next: (v: any) => this._snackBar.open(v.message, 'close', { duration: 5000 }),
                    error: (e) => this._snackBar.open(e.error.message, 'close', { duration: 5000 }),
                    complete: () => this.dialogRef.close(true)
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
