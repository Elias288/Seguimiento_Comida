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
        @Inject(MAT_DIALOG_DATA) public data: { jwt: string, userId: string, roles: Array<string> },
        private userService: UserService,
        private _snackBar: MatSnackBar,
    ) { }

    rolesForm: FormGroup = new FormGroup({
        admin: new FormControl(this.data.roles.includes('ADMIN')),
        comensal: new FormControl(this.data.roles.includes('COMENSAL')),
        cocinero: new FormControl(this.data.roles.includes('COCINERO')),
    })

    get admin() {
        return this.rolesForm.get('admin')
    }

    get comensal() {
        return this.rolesForm.get('comensal')
    }

    get cocinero() {
        return this.rolesForm.get('cocinero')
    }

    updateRoles() {
        const roles: Array<string> = []
        
        this.admin?.value ? roles.push('ADMIN') : ''
        this.comensal?.value ? roles.push('COMENSAL') : ''
        this.cocinero?.value ? roles.push('COCINERO') : ''

        // console.log(this.data);
        
        this.userService.addRole(this.data.jwt, this.data.userId, roles.toString()).subscribe({
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
