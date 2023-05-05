import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SocketIoService } from 'src/app/services/socket-io/socket-io.service';
import { User } from 'src/app/utils/user.interface';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    user!: User
    isLogged: boolean = false

    constructor(
        private router: Router,
        private authService: AuthService,
        private socket: SocketIoService,
        private _snackBar: MatSnackBar,
    ) {
        this.authService.isLoggedIn$.subscribe(isLogged => {
            this.isLogged = isLogged
            if (isLogged) {
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

            if (!isLogged){
                this.router.navigate([''])
            }
        })

        this.authService.user$.subscribe(user => {
            if (user._id) {
                this.user = user
                this.socket.newUser(user._id, user.email, user.rol)
            }
        })

        this.socket.getOnlineUsers((users: string[]) => {
            this.authService.setOnlineUsers(users)
        })
    }
}
