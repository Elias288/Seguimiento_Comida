import { Component, Inject, OnInit} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { UserService } from 'src/app/services/user/user.service';

@Component({
    selector: 'app-roles-form',
    templateUrl: './roles-form.component.html',
    styleUrls: ['./roles-form.component.scss']
})
export class RolesFormComponent{
    constructor (
        public dialogRef: MatDialogRef<RolesFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { jwt: string, userId: string, rol: string },
        private userService: UserService,
        private _snackBar: MatSnackBar,
    ) { }

    rolesForm: FormGroup = new FormGroup({
        rol: new FormControl(""),
    })

    get rol() {
        return this.rolesForm.get('rol')?.value || 3
    }

    updateRoles() {
        this.userService.addRole(this.data.jwt, this.data.userId, this.rol).subscribe({
            next:(v: any) => {
                this._snackBar.open(v.message, 'close', { duration: 5000 })
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
