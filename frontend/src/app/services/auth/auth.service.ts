import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { User } from 'src/app/utils/user.interface';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _isLoggedIn$ = new BehaviorSubject<boolean>(false)
    isLoggedIn$ = this._isLoggedIn$.asObservable()

    constructor(
        private userService: UserService
    ) {
        const token = localStorage.getItem('jwt')
        this._isLoggedIn$.next(!!token)
    }

    login(email: string, password: string) {
        return this.userService.login(email, password).pipe(
            tap((res: any) => {
                this._isLoggedIn$.next(true)
                localStorage.setItem('jwt', res.jwt)
            })
        )
    }

    getMe(jwt: string) {
        return this.userService.getMe(jwt).pipe(
            tap((res: any) => {
                return res
            })
        )
    }

    logout() {
        this.userService.logout()
    }
}
