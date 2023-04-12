import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    constructor(
        private router: Router,
        private authService: AuthService,
    ) {
        this.authService.isLoggedIn$.subscribe(status => {
            if (!status){
                this.router.navigate([''])
            }
        })
    }
}
