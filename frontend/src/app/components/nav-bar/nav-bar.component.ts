import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
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
export class NavBarComponent implements OnInit{
    hasRoles: boolean = false               // TIENE EL ROL PARA MOSTRARLO
    canAdmin: boolean = false               // TIENE EL ROL PARA ADMINISTRAR
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
        private activatedRoute: ActivatedRoute,
        private _snackBar: MatSnackBar,
        public dialog: MatDialog,
        public socketIoService: SocketIoService,
    ) {
        
        authService.user$.subscribe(user => {
            this.userInfo = user
            this.canAdmin = user.rol >= 0 && user.rol < 2
            this.hasRoles = user.rol >= 0

            if (user._id != '') {
                this.requestNotifications(user._id)
            }
        })

        socketIoService.notifications((notificaciones: Notification[]) => {
            this.notificationCountHidden = true
            this.activeNotificationsCount = 0
            
            notificaciones.map(notification => {
                notification.createdTime = new Date(notification.createdTime).toLocaleString('es-US', { timeZone: 'America/Montevideo' , hour12: false})
                if (notification.active) {
                    this.activeNotificationsCount = this.activeNotificationsCount + 1
                }
            })
            this.notifications = notificaciones

            if (this.activeNotificationsCount > 0)
                this.notificationCountHidden = false
        })

        socketIoService.getNotifications(() => {
            this.requestNotifications(this.userInfo._id)
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
                        
                        this.router.navigate(['/seguimiento-almuerzo'])
                    })
                }
            }
        
            newNotification.createdTime = new Date(newNotification.createdTime).toLocaleString('es-US', { timeZone: 'America/Montevideo' , hour12: false})

            if (this.activeNotificationsCount > 0) this.notificationCountHidden = false

            this.notifications.push(newNotification)
        })

        socketIoService.getIsConnected((isConnected: boolean) => {
            this.connected = isConnected
        })

        socketIoService.getWebSocketError((error: any) => {
            this._snackBar.open(error.errorMessage, 'close', { duration: 5000 })
        })
    }
    
    ngOnInit(): void {
        this.activatedRoute.fragment.subscribe((value) => {
            value && this.jumpTo(value)
        })
    }

    jumpTo(section: string) {
        setTimeout(() => {
            document.getElementById(section)?.scrollIntoView()
        }, 500);
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

    public logout() {
        this.authService.logout()
    }

    requestRol() {
        this.socketIoService.requestRol();
    }

    requestNotifications(userId: string) {
        this.socketIoService.requestNotifications(userId)
    }

    activeNotification(notificationId: string, userId: string) {
        this.socketIoService.activeNotification(notificationId, userId)
    }

    deleteNotification(notificationId: string, userId: string) {
        this.socketIoService.deleteNotification(notificationId, userId)
    }
}
