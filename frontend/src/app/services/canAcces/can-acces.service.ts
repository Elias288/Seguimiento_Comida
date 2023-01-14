import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';

@Injectable()
export class CanAccesService implements CanActivate{

    constructor(
        // private userService: UserService,
        private authService: AuthService,
        private router: Router,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.authService.isLoggedIn$.pipe(
            tap((isLoggedIn) => {
                if (!isLoggedIn) this.router.navigate([''])
            })
        )
    }
}
