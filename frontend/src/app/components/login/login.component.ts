import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup
    hide = true;

    constructor(
        private router: Router,
        private _snackBar: MatSnackBar,
        private authService: AuthService,
    ) {
        authService.isLoggedIn$.subscribe(status => {
            if (status){
                router.navigate(['seguimiento-almuerzo'])
            }
        })
    }

    ngOnInit() {
        this.loginForm = new FormGroup({
            email: new FormControl("", [
                Validators.required,
                Validators.minLength(3),
            ]),
            password: new FormControl("", [
                Validators.required,
                Validators.minLength(3),
            ])
        })
    }

    onSubmit(): void {
        const { email, password } = this.loginForm.value
        this.authService.login(email, password).subscribe({
            error: (e) => {
                console.log(e);
                if(e.error.errorCode) {
                    this._snackBar.open(e.error.errorMessage, 'close', { duration: 5000 })
                } else {
                    this._snackBar.open('Error del servidor', 'close', { duration: 5000 })
                }
            },
            complete: () => {
                this.router.navigate(['seguimiento-almuerzo'])
            }
        })
    }
}
