import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SocketIoService } from './services/socket-io/socket-io.service';
import { AuthService } from './services/auth/auth.service';
import { User } from './utils/user.interface';

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
        private socket: SocketIoService,
    ) {
        this.authService.user$.subscribe(user => {
            if (user._id) {
                this.user = user
                this.socket.newUser(user._id, user.email)
            }
        })

        authService.isLoggedIn$.subscribe(isLogged => {
            if (isLogged && !this.user) {
                this.authService.getUser().subscribe(user => {
                    this.authService.setUserInfo(user as User)
                })
            }
        })

    }
}
