import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SocketIoService } from 'src/app/services/socket-io/socket-io.service';
import { User } from 'src/app/utils/user.interface';
import { CreateMenuDialogComponent } from '../create-menu-dialog/create-menu-dialog.component';
import { Notification } from 'src/app/utils/notification.interface';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit{
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
    ) {
        authService.isLoggedIn$.subscribe(status => {
            this.logged = status
            if (status) {
                this.authService.getUser().subscribe({
                    next: (v: User) => {
                        this.userName = v.name
                        this.myId = v._id
                        this.hasRoles = parseInt(v.rol) < 2

                        socketIoService.getNotifications((data: any) => {
                            const notifications = data.filter(({emisor}: Notification) => emisor != v._id)
                            this.activeNotifications = notifications.filter(({active}: Notification) => active)
                            
                            // console.log('getNotifications', notifications);
                            this.notification = notifications
                        })
                        
                        socketIoService.getNewNotification((data: any) => {
                            // console.log('getNewNotification', data);
                            this.notification.push(data)
                        })
                    },
                    error: (e) => {
                        window.localStorage.removeItem('jwt')
                        window.location.href = '/'
                    }
                })
            }
        })
    }

    ngOnInit() {}

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

    public logout() {
        this.authService.logout()
    }
}
