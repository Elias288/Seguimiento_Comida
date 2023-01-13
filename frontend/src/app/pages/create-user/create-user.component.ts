import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/utils/user.interface';

@Component({
    selector: 'app-create-user',
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit{
    createUserForm!: FormGroup
    userData: User = {
        _id: "",
        name: "",
        surName: "",
        email: "",
        password: "",
        password2: "",
        kitchener: false,
        admin: false,
    }

    constructor(
        private router: Router,
        private userService: UserService,
        private _snackBar: MatSnackBar
    ) { }
    
    ngOnInit(): void {
        this.createUserForm = new FormGroup({
            name: new FormControl(this.userData.name, [
                Validators.required,
                Validators.minLength(3),
            ]),
            surName: new FormControl(this.userData.surName),
            email: new FormControl(this.userData.email, [
                Validators.required,
                Validators.minLength(3),
            ]),
            password: new FormControl(this.userData.password, [
                Validators.required,
                Validators.minLength(3),
            ]),
            password2: new FormControl(this.userData.password2, [
                Validators.required,
                Validators.minLength(3),
            ]),
        })
    }

    onSubmit(): any {
        this.userData.email = this.createUserForm.controls['email'].value
        this.userData.surName = this.createUserForm.controls['surName'].value
        this.userData.name = this.createUserForm.controls['name'].value
        this.userData.password = this.createUserForm.controls['password'].value
        this.userData.password2 = this.createUserForm.controls['password2'].value
        
        this.userService.create(this.userData).then(data => {
            if (data.error) {
                this._snackBar.open(data.message, 'close', {
                    duration: 5000
                })
                return
            }

            this.router.navigate(['login'])
        })
    }
}
