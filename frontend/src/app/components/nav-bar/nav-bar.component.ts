import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
        private router: Router,
        private authService: AuthService,
    ) {
        authService.isLoggedIn$.subscribe(status => {
            this.logged = status
            if (status) {
                this.authService.getUser().subscribe({
                    next: (v) => {
                        this.userName = v.name
                        this.roles = v.roles
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

    createMenu() {
        this.router.navigate(['create/menu/0'])
    }

    public logout() {
        this.authService.logout()
    }
}
