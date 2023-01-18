import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CalendarComponent } from '../calendar/calendar.component';
import { CreateMenuDialogComponent } from '../create-menu-dialog/create-menu-dialog.component';

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
        public dialog: MatDialog,
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
}
