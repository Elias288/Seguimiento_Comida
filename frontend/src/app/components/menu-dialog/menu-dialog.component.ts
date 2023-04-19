import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SocketIoService } from 'src/app/services/socket-io/socket-io.service';
import { Menu } from 'src/app/utils/menu.inteface';
import { User } from 'src/app/utils/user.interface';
import { ConfirmCancelDialogComponent } from '../confirm-cancel-dialog/confirm-cancel-dialog.component';
import { MatTableDataSource } from '@angular/material/table';

@Component({
    selector: 'app-menu-dialog',
    templateUrl: './menu-dialog.component.html',
    styleUrls: ['./menu-dialog.component.scss'],
    providers: []
})
export class MenuDialogComponent implements OnInit {
    day: any = this.data.day                                // TODA LA INFORMACIÓN DEL DIA
    menu: Menu = this.day.menu                              // TODA LA INFORMACIÓN DEL MENU
    completeDate: Date = this.data.completeDate             // FECHA COMPLETA DEL MENU
    localDate: string = new Date(this.data.completeDate).toLocaleDateString()
    mySelectedMenu: string = this.data.mySelectedMenu       // MENU DEL USUARIO LOGUEADO
    usersInMenu!: Array<User>                               // USUARIOS EN EL MENU
    
    canBeAddedToMenu: boolean = this.data.canBeAddedToMenu  // PUEDE AGREGARSE AL MENÚ
    canManageMenus: boolean = this.data.canManageMenus      // PUEDE ADMINISTAR MENUS
    outOfDate: boolean = false                              // INDICA SI EL MENÚ ESTÁ FUERA DE FECHA

    dataCountMenuOption = [{ MP: 0, MS: 0, total: 0 }]
    displayedCountColumns: Array<string> = [ 'menu_principal', 'menu_secundario', 'total' ]
    dataComensales: any
    displayedComensalesColumns: Array<string> = [ 'menu_option', 'hour', 'name', 'surName', 'email' ]

    menuData!: FormGroup 
    matButtonToggleGroup!: any 
    toggleEditMenu: Boolean = false

    constructor(
        public dialogRef: MatDialogRef<MenuDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private authService: AuthService,
        private _snackBar: MatSnackBar,
        public dialog: MatDialog,
        public socketIoService: SocketIoService,
        public fb: FormBuilder,
    ) {
        socketIoService.getWebSocketError((error: any) => {
            this._snackBar.open(error.errorMessage, 'close', { duration: 5000 })
            this.onNoClick()
        })

        this.socketIoService.getAddedMenu(() => {
            this._snackBar.open('Agregado al menu', 'close', { duration: 5000 })
            this.onNoClick()
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
        if (this.menu.users) {
            this.usersInMenu = this.menu.users
            this.dataCountMenuOption = [{ 
                MP: this.menu.users.filter(user => user.Menu_User?.selectedMenu == 'MP').length,
                MS: this.menu.users.filter(user => user.Menu_User?.selectedMenu == 'MS').length,
                total: this.menu.users.length,
            }]
            
            this.dataComensales = new MatTableDataSource(
                this.menu.users.map(u => {
                    const date = u.Menu_User?.entryDate && new Date(u.Menu_User.entryDate)
                    return {
                        menu_option: u.Menu_User?.selectedMenu,
                        hour: date?.toLocaleString('es-US', { hour12: false }),
                        name: u.name,
                        surName: u.surName,
                        email: u.email,
                    }
                })
            );
        }
        
        this.outOfDate = new Date().getTime() >= new Date(this.menu.date).getTime()

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

    onNoClick(): void {
        this.dialogRef.close()
    }
    
    registrationForm = this.fb.group({
        menuOption: [this.mySelectedMenu, [Validators.required]]
    })

    public deleteMenu() {
        const message = "¿Seguro que quiere elminar este menu?"
        const dialogref = this.openConfirmCancelDialog(message)
        dialogref.afterClosed().subscribe(result => {
            if (result) {
                this.socketIoService.deleteMenu(`Bearer ${this.authService.token}`, this.data.day.menu._id)
            }
        })
    }

    public toggleUpdateMenu() {
        this.toggleEditMenu = !this.toggleEditMenu
    }
    
    public updateMenu() {
        this.openConfirmCancelDialog("¿Seguro que quiere actualizar este menu?")
        .afterClosed().subscribe(result => {
            if (result) {
                const menu: Menu = { _id: this.data.day.menu._id, ...this.menuData.value }
                this.socketIoService.updateMenu(`Bearer ${this.authService.token}`, menu)
            } else {
                this.onNoClick()
            }
        })
    }

    public addtoMenu(value: string) {
        this.openConfirmCancelDialog('Agregarse al menu?')
        .afterClosed().subscribe(result => {
            if (result) {
                this.socketIoService.addToMenu(`Bearer ${this.authService.token}`, this.menu._id, value, new Date())
            } else {
                this.onNoClick()
            }
        })
    }

    public deleteToMenu(menuId: string) {
        this.openConfirmCancelDialog('Seguro que se quiere dar de baja del menu?')
        .afterClosed().subscribe(result => {
            if (result) {
                this.socketIoService.dropToMenu(`Bearer ${this.authService.token}`, menuId, new Date())
            } else {
                this.onNoClick()
            }
        })
    }

    private openConfirmCancelDialog(message: string){
        return this.dialog.open(ConfirmCancelDialogComponent, {
            data: { message }
        })
    }
}
