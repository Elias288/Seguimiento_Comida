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
    logged: boolean = false                 // ESTÁ LOGUEADO
    hasRoles: boolean = false               // TIENE EL ROL PARA MOSTRARLO
    userInfo!: User                         // NOMBRE DEL USUARIO LOGUEADO
    isMenuOpen: boolean = false
    connected: boolean = false
    
    activeNotificationsCount: number = 0
    notifications: Array<any> = []
    isNotificationOpen: boolean = false
    notificationCountHidden: boolean = true

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
            this.userInfo = user
            this.hasRoles = user.rol >= 0 && user.rol < 2

            this.requestNotifications(user._id)
        })

        socketIoService.getNewNotification((newNotification: Notification) => {
            if (newNotification.active) {
                this.activeNotificationsCount = this.activeNotificationsCount + 1

                const snackbarRef = this._snackBar.open(newNotification.message, 'close', { duration: 5000 })
                if (newNotification.notificationTitle === 'notifyRoleChanged') {
                    snackbarRef.afterDismissed().subscribe(() => {
                        this.authService.getUser().subscribe({
                            error: (e) => {
                                console.error(e);
                            }
                        })
                        
                        this.router.navigate(['/home'])
                    })
                }
            }
        
            newNotification.createdTime = new Date(newNotification.createdTime).toLocaleString('es-US', { timeZone: 'America/Montevideo' })

            if (this.activeNotificationsCount > 0) this.notificationCountHidden = false

            this.notifications.push(newNotification)
        })

        socketIoService.getIsConnected((isConnected: boolean) => {
            this.connected = isConnected
        })
    }

    public toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen
    }

    public toggleNotifications() {
        this.isNotificationOpen = !this.isNotificationOpen
        this.toggleMenu()
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

    public goToHome() {
        this.toggleMenu()
        this.router.navigate(['/home'])
    }

    public goToUsuarios() {
        this.toggleMenu()
        this.router.navigate(['/users'])
    }

    public goToPerfil() {
        this.toggleMenu()
        this.router.navigate([`/perfil/${this.userInfo._id}`])
    }

    public goToHelps() {
        this.toggleMenu()
        this.router.navigate(['/helps'])
    }

    public logout() {
        this.authService.logout()
    }

    requestRol() {
        this.socketIoService.requestRol();
    }

    requestNotifications(userId: string) {
        this.socketIoService.requestNotifications(userId, this.userInfo.rol);
    }
}
