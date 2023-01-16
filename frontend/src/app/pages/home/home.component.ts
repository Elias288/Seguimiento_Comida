import { Component, OnInit } from '@angular/core';
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
    menues!: any
    constructor(
        private router: Router,
        private menuService: MenuService,
        private _snackBar: MatSnackBar,
        private authService: AuthService
    ) {
        authService.isLoggedIn$.subscribe(status => {
            if (!status){
                router.navigate([''])
            }
        })
    }

    ngOnInit(): void {
        this.menuService.getAllMenues().subscribe({
            next: (v) => {
                console.log(v)
                this.menues = v
            },
            error: (e) => this._snackBar.open(e.error.message, 'close', { duration: 5000 }),
            complete: () => console.log('menues')
            
        })
    }

}
