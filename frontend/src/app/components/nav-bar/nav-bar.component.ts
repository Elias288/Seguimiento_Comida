import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit{
    logged: boolean = false
    userName!: string

    constructor(
        private authService: AuthService
    ) {
        authService.isLoggedIn$.subscribe(status => {
            this.logged = status
            if (status) {
                authService.getMe(localStorage.getItem('jwt')!).subscribe(user => {
                    this.userName = user.name
                })
            }
        })
    }

    async ngOnInit() {}

    public logout() {
        this.authService.logout()
    }
}
