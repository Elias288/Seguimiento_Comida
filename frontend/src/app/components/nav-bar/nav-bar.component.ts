import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SocketIoService } from 'src/app/services/socket-io/socket-io.service';
import { User } from 'src/app/utils/user.interface';
import { CreateMenuDialogComponent } from '../create-menu-dialog/create-menu-dialog.component';
import { Notification } from 'src/app/utils/notification.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
    logged: boolean = false         // ESTÁ LOGUEADO
    userName!: string               // NOMBRE DEL USUARIO LOGUEADO
    hasRoles: boolean = false       // TIENE EL ROL PARA MOSTRARLO
    myId!: string
    notification: Array<any> = []
    activeNotifications: Array<any> = []
    isMenuOpen = false

    constructor(
        private router: Router,
        private authService: AuthService,
        public dialog: MatDialog,
        public socketIoService: SocketIoService,
        private _snackBar: MatSnackBar,
    ) {
        authService.isLoggedIn$.subscribe(status => {
            this.logged = status
        })

        authService.user$.subscribe(user => {
            this.userName = user.name
            this.myId = user._id
            this.hasRoles = user.rol >= 0 && user.rol < 2
        })

        socketIoService.getNewNotification((newNotification: Notification) => {
            const { notificationTitle, message, active } = newNotification
            
            const snackbarRef = this._snackBar.open(message, 'close', { duration: 5000 })
            this.notification.push(newNotification)

            if (notificationTitle === 'notifyRoleChanged') {
                snackbarRef.afterDismissed().subscribe(() => {
                    this.router.navigate(['/home'])
                    this.authService.getUser().subscribe(user => {
                        this.authService.setUserInfo(user as User)
                    })
                })
            }
        })
    }

    public toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen
    }

    public createMenu() {
        this.toggleMenu()
        const dialogRef = this.dialog.open(CreateMenuDialogComponent, {
            data : {
                date: 0
            }
        })
        dialogRef.afterClosed().subscribe(result => {
            window.location.href = '/'
        })
    }

    public goToUsuarios() {
        this.toggleMenu()
        this.router.navigate(['/users'])
    }

    public goToPerfil() {
        this.toggleMenu()
        this.router.navigate([`/perfil/${this.myId}`])
    }

    public goToHelps() {
        this.toggleMenu()
        this.router.navigate(['/helps'])
    }

    public logout() {
        this.authService.logout()
    }
}
