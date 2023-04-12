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
                router.navigate(['home'])
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
        this.authService.login(this.loginForm.controls['email'].value, this.loginForm.controls['password'].value).subscribe({
            error: (e) => this._snackBar.open(e.error.errorMessage, 'close', { duration: 5000 }),
            complete: () => this.router.navigate(['home'])
        })
    }
}
