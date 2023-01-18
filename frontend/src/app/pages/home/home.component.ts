import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuService } from 'src/app/services/menu/menu.service';
import { UserService } from 'src/app/services/user/user.service';
import { Menu } from 'src/app/utils/menu.inteface';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    constructor(
        private router: Router,
        private _snackBar: MatSnackBar,
        private authService: AuthService
    ) {
        authService.isLoggedIn$.subscribe(status => {
            if (!status){
                router.navigate([''])
            }
        })
    }

    ngOnInit(): void {}

}
