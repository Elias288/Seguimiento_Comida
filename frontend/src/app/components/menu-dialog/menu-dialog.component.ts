import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SocketIoService } from 'src/app/services/socket-io/socket-io.service';
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
    hasRoles: boolean = false
    isAdmin: boolean = false
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
        private authService: AuthService,
        private _snackBar: MatSnackBar,
        public dialog: MatDialog,
        public socketIoService: SocketIoService,
    ) {
        socketIoService.getWebSocketError((error: any) => {
            this._snackBar.open(error.message, 'close', { duration: 5000 })
            this.dialogRef.close(true)
        })

        this.socketIoService.getAddedMenu(() => {
            this._snackBar.open('Agregado al menu', 'close', { duration: 5000 })
            this.dialogRef.close(true)
        })

        this.socketIoService.getDeletedToMenu(() => {
            this._snackBar.open('Eliminado del menu', 'close', { duration: 5000 })
            this.dialogRef.close(true)
        })

        this.socketIoService.getDeletedMenu(() => {
            this._snackBar.open('Menu eliminado exitosamente', 'close', { duration: 5000 })
            this.dialogRef.close(true)
        })

        this.socketIoService.getUpdatedMenu(() => {
            this._snackBar.open('Menu actualizado', 'close', { duration: 5000 })
            this.dialogRef.close(true)
        })
    }

    ngOnInit(): void {
        this.day = this.data.day
        this.menu = this.day.menu
        this.completeDate = this.data.completeDate
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
                this.hasRoles = v.rol != 3
                this.isAdmin = v.rol < 2
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
                this.socketIoService.deleteMenu(`Bearer ${this.authService.token}`, this.data.day.menu._id)
            }
        })
    }

    public updateMenu() {
        this.openConfirmCancelDialog("¿Seguro que quiere actualizar este menu?")
        .afterClosed().subscribe(result => {
            if (result) {
                const menu: Menu = { _id: this.data.day.menu._id, ...this.menuData.value }
                this.socketIoService.updateMenu(`Bearer ${this.authService.token}`, menu)
            }
        })
    }

    public addtoMenu(value: string) {
        this.openConfirmCancelDialog('Agregarse al menu?')
        .afterClosed().subscribe(result => {
            if (result) {
                this.socketIoService.addToMenu(`Bearer ${this.authService.token}`, this.menu._id, value, new Date())
            }
        })
    }

    public deleteToMenu(menuId: string) {
        this.openConfirmCancelDialog('Seguro que se quiere dar de baja del menu?')
        .afterClosed().subscribe(result => {
            if (result) {
                this.socketIoService.dropToMenu(`Bearer ${this.authService.token}`, menuId)
            }
        })
    }

    private openConfirmCancelDialog(message: string){
        return this.dialog.open(ConfirmCancelDialogComponent, {
            data: { message }
        })
    }
}
