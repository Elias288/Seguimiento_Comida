import { Component, Inject, OnInit} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketIoService } from 'src/app/services/socket-io/socket-io.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
    selector: 'app-roles-form',
    templateUrl: './roles-form.component.html',
    styleUrls: ['./roles-form.component.scss']
})
export class RolesFormComponent {
    actualRol: string = this.data.rol

    constructor (
        public dialogRef: MatDialogRef<RolesFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { jwt: string, userId: string, rol: string },
        private userService: UserService,
        private _snackBar: MatSnackBar,
        public fb: FormBuilder,
        private socket: SocketIoService,
    ) { }

    rolesForm = this.fb.group({
        rolOption: [this.actualRol, [Validators.required]]
    })

    get rol() {
        return this.rolesForm.get('rolOption')?.value || "-1"
    }

    updateRoles() {
        this.userService.addRole(this.data.jwt, this.data.userId, this.rol).subscribe({
            next:(v: any) => {
                this._snackBar.open(v.message, 'close', { duration: 5000 })
                this.socket.notifyRoleChanged(this.data.userId, this.rol)
            },
            error: (e) => {
                this._snackBar.open(e.message, 'close', { duration: 5000 })
                this.dialogRef.close()
            },
            complete: () => {
                this.dialogRef.close()
            }
        })

        this.dialogRef.close()
    }
}
