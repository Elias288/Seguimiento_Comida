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
    roles!: string[]

    constructor(
        private authService: AuthService
    ) {
        authService.isLoggedIn$.subscribe(status => {
            this.logged = status
            if (status && localStorage.getItem('jwt')) {
                authService.getMe(localStorage.getItem('jwt')!).subscribe(user => {
                    // console.log(user)
                    this.userName = user.name
                    this.roles = user.roles
                })
            }
        })
    }

    async ngOnInit() {}

    public logout() {
        this.authService.logout()
    }
}
