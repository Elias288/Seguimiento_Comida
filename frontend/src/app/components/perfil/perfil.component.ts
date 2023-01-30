import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/user/user.service';
import { User } from 'src/app/utils/user.interface';
import { ConfirmCancelDialogComponent } from '../confirm-cancel-dialog/confirm-cancel-dialog.component';

@Component({
    selector: 'app-perfil',
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent {
    userInfo: User = {
        _id: '',
        name: '',
        surName: '',
        email: '',
        roles: [],
        password: '',
        password2: '',
        Menu_User: undefined,
    }
    myId!: string
    perfilId!: string
    itsMe: boolean = false
    itsAdmin: boolean = false

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private router: Router,
    ){
        this.activatedRoute.params.subscribe((params) => {
            this.perfilId = params['userId']
            this.userService.getUserById(this.authService.token, this.perfilId)
            .subscribe({
                next: (v) => {
                    const user = v as User
                    this.userInfo = user
                    this.authService.getUser().subscribe({
                        next: (u:User) => {
                            this.myId = u._id
                            this.itsMe = user._id == u._id
                            this.itsAdmin = u.roles.includes('ADMIN')
                        }
                    })
                },
                error: () => window.location.href = '/home'
            })
        })
    }

    public deleteUser() {
        this.dialog.open(ConfirmCancelDialogComponent, {
            data: {
                message: '¿Seguro que quiere eliminar el usuario?'
            }
        }).afterClosed().subscribe(result => {
            if (result) {
                this.userService.deleteUser(this.authService.token, this.perfilId).subscribe({
                    next: () => this._snackBar.open('Usuario eliminado exitosamente', 'close', { duration: 5000 }),
                    error: (e) => {this._snackBar.open(e.error.message, 'close', { duration: 5000 })},
                    complete: () => {
                        if(this.myId == this.perfilId) {
                            this.authService.logout()
                        }
                        this.router.navigate(['home'])
                    },
                })
            }
        })
    }

    public updateUser() {
        window.alert('update User')
    }
}
