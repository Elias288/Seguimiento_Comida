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

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private router: Router,
        private socketIoService: SocketIoService, 
    ){
        this.activatedRoute.params.subscribe((params) => {
            this.perfilId = params['userId']
            this.userService.getUserById(this.authService.token, this.perfilId)
            .subscribe({
                next: (v) => {
                    const user = v as User
                    this.userInfo = user
                    const ROLES = [
                        'ADMIN',     
                        'COCINERO',  
                        'COMENSAL',  
                        ''           
                    ]
                    this.rol = ROLES[parseInt(this.userInfo.rol)]
                    
                    this.authService.getUser().subscribe({
                        next: (u:User) => {
                            this.myId = u._id
                            this.itsMe = user._id == u._id
                            this.hasRole = user.rol != "" && parseInt(u.rol) != 3
                            this.itsAdmin = parseInt(u.rol) == 0

                            socketIoService.getNotifications((data: any) => {
                                const requestRole = data.find(({ name }: Notification) => name == 'requestRol')
                                if (requestRole) this.requestRolSended = true
                                
                            })
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

    public requestRol() {
        if (this.itsMe) {
            this.socketIoService.requestRol(`Bearer ${this.authService.token}`, this.userInfo)
            this.requestRolSended = true
        }
    }
}
