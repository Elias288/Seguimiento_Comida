import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SocketIoService } from 'src/app/services/socket-io/socket-io.service';
import { UserService } from 'src/app/services/user/user.service';
import { User } from 'src/app/utils/user.interface';
import { ConfirmCancelDialogComponent } from '../../components/confirm-cancel-dialog/confirm-cancel-dialog.component';
import { Notification } from 'src/app/utils/notification.interface';

@Component({
    selector: 'app-perfil',
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent{
    userInfo!: User
    myId!: string
    perfilId!: string
    itsMe: boolean = false
    itsAdmin: boolean = false
    rol: string = ""
    requestRolSended: boolean = false
    hasRole: boolean = false

    ROLES = [
        'SIN ROL',
        'ADMINISTRADOR',
        'COCINERO',
        'COMENSAL',
    ]

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        private _snackBar: MatSnackBar,
    ){
        this.activatedRoute.params.subscribe((params) => {
            this.perfilId = params['userId']
            this.userService.getUserById(this.authService.token, this.perfilId)
            .subscribe({
                next: (v) => {
                    const user = v as User
                    this.userInfo = user
                    this.rol = this.ROLES[Number(this.userInfo.rol) + 1]
                    
                },
                error: () => window.location.href = '/home'
            })
            
            this.authService.user$.subscribe(user => {
                this.myId = user._id
                this.itsMe = this.perfilId == this.myId
                this.hasRole = user.rol >= 0
                this.itsAdmin = user.rol == 0
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
                    },
                })
            }
        })
    }

    public openUpdateUser() {
        
    }
}
