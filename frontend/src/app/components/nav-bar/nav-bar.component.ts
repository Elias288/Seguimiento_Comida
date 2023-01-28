import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { User } from 'src/app/utils/user.interface';
import { CreateMenuDialogComponent } from '../create-menu-dialog/create-menu-dialog.component';

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

    isMenuOpen = false

    constructor(
        private router: Router,
        private authService: AuthService,
        public dialog: MatDialog,
    ) {
        authService.isLoggedIn$.subscribe(status => {
            this.logged = status
            if (status) {
                this.authService.getUser().subscribe({
                    next: (v: User) => {
                        this.userName = v.name
                        this.myId = v._id
                        this.hasRoles = v.roles.includes('COCINERO') || v.roles.includes('ADMIN')
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
