import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmCancelDialogComponent } from 'src/app/components/confirm-cancel-dialog/confirm-cancel-dialog.component';
import { RolesFormComponent } from 'src/app/components/roles-form/roles-form.component';
import { UsersTableComponent } from 'src/app/components/users-table/users-table.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/user/user.service';
import { User } from 'src/app/utils/user.interface';

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit{
    myRoles!: string[]
    admin!: boolean
    myId!: string
    showRoleForm: boolean = false
    @ViewChild(UsersTableComponent) table!: UsersTableComponent

    actionsFunctions = [
        { name: 'Editar Roles', option: 'addRoles' },
        { name: 'Eliminar', option: 'delete', color: 'warn'},
    ]

    constructor (
        public authService: AuthService,
        public userService: UserService,
        public dialog: MatDialog,
    ) { 
        this.authService.isLoggedIn$.subscribe(status => {
            if (status) {
                this.authService.getUser().subscribe({
                    next: (v) => {
                        this.myRoles = v.roles
                        this.admin = v.roles.includes('ADMIN')
                    }
                })
                this.authService.getUser().subscribe({
                    next: (v) => {
                        this.myId = v._id
                    },
                    error: (e) => {
                        console.error(e);
                    }
                })
            }
        })
    }

    ngOnInit(): void { }

    public getFunctions(res: any) {
        const { user, option } = res
        
        const options: any = {
            delete: (user: User) => {
                this.openConfirmCancelDialog("¿Seguro que quiere actualizar este usuario?")
                .afterClosed().subscribe(result => {
                    if (result) {
                        console.log('no implementado')
                    }
                })
            },
            addRoles: (user: User) => {
                const dialogRef = this.dialog.open(RolesFormComponent, {
                    data: {
                        jwt: this.authService.token,
                        userId: user._id,
                        roles: user.roles
                    }
                })

                dialogRef.afterClosed().subscribe(res => {
                    this.table.updateUsers()
                })
            },
        }

        options[option](user)
    }

    private openConfirmCancelDialog(message: string){
        return this.dialog.open(ConfirmCancelDialogComponent, {
            data: { message }
        })
    }
}
