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
        this._isLoggedIn$.next(!!this.token)
    }

    get token(): any {
        return localStorage.getItem('jwt')
    }

    public login(email: string, password: string) {
        return this.userService.login(email, password).pipe(
            tap((res: any) => {
                localStorage.setItem('jwt', res.jwt)
                this._isLoggedIn$.next(true)
            })
        )
    }
    
    public getUser() {
        return this.userService.getMe(this.token).pipe(
            tap((res:any) => {
                return res
            })
        )
    }

    logout() {
        this.userService.logout()
    }
}
