import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SocketIoService } from './services/socket-io/socket-io.service';
import { AuthService } from './services/auth/auth.service';
import { User } from './utils/user.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = "Seguimiento comida"
    user!: User

    constructor (
        private authService: AuthService,
        private _snackBar: MatSnackBar,
        private socket: SocketIoService,
    ) {
        this.authService.user$.subscribe(user => {
            if (user._id) {
                this.user = user
                this.socket.newUser(user._id, user.email, user.rol)
            }
        })

        authService.isLoggedIn$.subscribe(isLogged => {
            if (isLogged && !this.user) {
                this.authService.getUser().subscribe({
                    next: () => {
                        socket.isConnected()
                    },
                    error: (e) => {
                        const snackbarRef = this._snackBar.open(e.error.details, 'close', { duration: 5000 })
                        snackbarRef.afterDismissed().subscribe(() => {
                            window.localStorage.removeItem('jwt')
                            window.location.href = '/'
                        })
                    }
                })
            }
        })

        this.socket.getOnlineUsers((users: string[]) => {
            this.authService.setOnlineUsers(users)
        })
    }
}
