import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { User } from 'src/app/utils/user.interface';

@Component({
    selector: 'app-create-user',
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit{
    hide1 = true;
    hide2 = true;
    userData!: FormGroup
    
    constructor(
        private router: Router,
        private userService: UserService,
        private _snackBar: MatSnackBar
    ) { }
    
    
    ngOnInit(): void {
        this.userData = new FormGroup({
            name: new FormControl<string>("", [
                Validators.required,
                Validators.minLength(3),
            ]),
            surName: new FormControl<string>(""),
            email: new FormControl<string>("", [
                Validators.required,
                Validators.minLength(3),
            ]),
            password: new FormControl<string>("", [
                Validators.required,
                Validators.minLength(3),
            ]),
            password2: new FormControl<string>("", [
                Validators.required,
                Validators.minLength(3),
            ]),
        })
    }

    onSubmit(): void {
        const { name, surName, email, password, password2 } = this.userData.value
        const roles: string[] = []

        const user: User = { _id: '', name, surName, email, password, password2, roles, Menu_User: undefined }
        this.userService.create(user).subscribe({
            next: (v) => this._snackBar.open('Usuario ' + v.email + ' creado exitosamente', 'close', { duration: 5000 }),
            error: (e) => this._snackBar.open(e.error.message, 'close', { duration: 5000 }),
            complete: () => this.router.navigate(['login'])
        })
    }
}
