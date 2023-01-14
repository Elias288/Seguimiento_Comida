import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../utils/user.interface'
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    ENDPOINT = 'http://localhost:8080/api'

    constructor(
        private http: HttpClient,
    ) { }

    public create(userData: User): Observable<any>  {
        const headers = { 'Content-Type': 'application/json' }
        const body = JSON.stringify(userData)
        return this.http.post(this.ENDPOINT + '/user', body, { 'headers': headers })
    }
    
    public login(email: String, password: String): Observable<Object> {
        const headers = { 'Content-Type': 'application/json' }
        const body = { email, password }
        return this.http.post(this.ENDPOINT + '/user/login', body, { 'headers': headers })
    }
    
    public getMe(jwt: String) {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        return this.http.get(this.ENDPOINT + '/user/me', { 'headers': headers })
    }

    public logout(): void {
        localStorage.removeItem('jwt')
        window.location.href="/"
    }
}
