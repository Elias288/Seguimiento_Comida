import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SocketIoService } from 'src/app/services/socket-io/socket-io.service';
import { UserService } from 'src/app/services/user/user.service';
import { User } from 'src/app/utils/user.interface';
import { ConfirmCancelDialogComponent } from '../../components/confirm-cancel-dialog/confirm-cancel-dialog.component';
import { Menu } from 'src/app/utils/menu.inteface';
import { MenuDialogComponent } from '../menu-dialog/menu-dialog.component';

@Component({
    selector: 'app-perfil',
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent {
    userInfo!: User
    myId!: string
    perfilId!: string
    itsMe: boolean = false
    itsAdmin: boolean = false
    rol: string = ""
    requestRolSended: boolean = false
    hasRole: boolean = false

    menusOfUser!: Array<any>
    canBeAddedToMenu: boolean = false   // PUEDE AGREGARSE AL MENÚ
    canManageMenus: boolean = false     // PUEDE ADMINISTAR MENUS

    ROLES = [
        'SIN ROL',
        'ADMINISTRADOR',
        'COCINERO',
        'COMENSAL',
    ]

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private socketIo: SocketIoService,
    ) {
        this.activatedRoute.params.subscribe((params) => {
            this.perfilId = params['userId']
            this.userService.getUserById(this.authService.token, this.perfilId)
                .subscribe({
                    next: (v) => {
                        const user = v as User
                        this.userInfo = user
                        this.rol = this.ROLES[Number(this.userInfo.rol) + 1]
                        this.canBeAddedToMenu = user.rol >= 0
                        this.canManageMenus = user.rol >= 0 && user.rol < 2
                        this.socketIo.requestMenuesOfUser(`Bearer ${this.authService.token}`, user._id)
                    },
                    error: () => window.location.href = '/'
                })

            this.authService.user$.subscribe(user => {
                this.myId = user._id
                this.itsMe = this.perfilId == this.myId
                this.hasRole = user.rol >= 0
                this.itsAdmin = user.rol == 0
            })

            this.socketIo.getMenues((menu: Array<Menu>) => {
                this.socketIo.requestMenuesOfUser(`Bearer ${this.authService.token}`, this.userInfo._id)
            })
        })

        this.socketIo.getMenusOfUser((menus: any) => {
            const menusOfUser = menus.map((menuOU: any) => {
                return { ...menuOU, Menu_Users: menuOU.Menu_Users[0] }
            }).sort((a: Menu, b: Menu) => {
                if (+new Date(a.date) < +new Date(b.date)) return 1
                return -1
            })
            this.menusOfUser = menusOfUser
        })
    }

    public deleteUser() {
        this.dialog.open(ConfirmCancelDialogComponent, {
            data: {
                message: '¿Seguro que quiere eliminar el usuario?'
            }
        }).afterClosed().subscribe(result => {
            if (result) {
                this.userService.deleteUser(this.authService.token, this.perfilId).subscribe({
                    next: () => this._snackBar.open('Usuario eliminado exitosamente', 'close', { duration: 5000 }),
                    error: (e) => { this._snackBar.open(e.error.message, 'close', { duration: 5000 }) },
                    complete: () => {
                        if (this.myId == this.perfilId) {
                            this.authService.logout()
                        }
                    },
                })
            }
        })
    }

    public openUpdateUser() { }

    public openMenuDialog(menu: Menu) {
        this.dialog.open(MenuDialogComponent, {
            data: {
                menu,
                mySelectedMenu: menu.Menu_Users && menu.Menu_Users.selectedMenu,
                canBeAddedToMenu: this.canBeAddedToMenu,
                canManageMenus: this.canManageMenus,
            },
            width: "100%"
        });
    }
}
