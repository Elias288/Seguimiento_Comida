import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup
    loginData = {
        email: "",
        password: ""
    }

    constructor(
        private router: Router,
        private userService: UserService,
        private _snackBar: MatSnackBar,
    ) {}

    ngOnInit() {
        this.loginForm = new FormGroup({
            email: new FormControl(this.loginData.email, [
                Validators.required,
                Validators.minLength(3),
            ]),
            password: new FormControl(this.loginData.password, [
                Validators.required,
                Validators.minLength(3),
            ])
        })

    }

    onSubmit(): void {
        this.loginData.email = this.loginForm.controls['email'].value
        this.loginData.password = this.loginForm.controls['password'].value
        
        this.userService.login(this.loginData.email, this.loginData.password).then(data => {
            if (data.error) {
                this._snackBar.open(data.message, 'close', {
                    duration: 5000
                })
                return
            }
            this.router.navigate(['home'])
        })
    }
}
