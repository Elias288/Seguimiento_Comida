import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from 'src/app/utils/user.interface';
import { UserService } from '../user/user.service';

const EMPTYUSER = {
    _id: "",
    email: "",
    name: "",
    password: "",
    password2: "",
    rol: -1,
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _isLoggedIn$ = new BehaviorSubject<boolean>(false)
    isLoggedIn$ = this._isLoggedIn$.asObservable()
    private _user$ = new BehaviorSubject<User>(EMPTYUSER)
    user$ = this._user$.asObservable()
    private _onlineUsers$ = new BehaviorSubject<string[]>([])
    onlineUsers$ = this._onlineUsers$.asObservable()

    userInfo!: User

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

    public setUserInfo (user: User) {
        this._user$.next(user)
        this.userInfo = user
    }
    
    public getUser() {
        return this.userService.getMe(this.token).pipe(
            tap((res) => {
                return res as User
            })
        )
    }

    public setOnlineUsers (users: string[]) {
        this._onlineUsers$.next(users)
    }

    logout() {
        this.userService.logout()
    }
}
