import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../../utils/user.interface'
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(
        private http: HttpClient,
    ) { 
        // console.log('production:', environment.production)
    }

    public create(userData: User): Observable<any>  {
        const headers = { 'Content-Type': 'application/json' }
        const body = JSON.stringify(userData)
        return this.http.post(`${environment.ENDPOINT}/api/user`, body, { 'headers': headers })
    }
    
    public login(email: String, password: String): Observable<Object> {
        const headers = { 'Content-Type': 'application/json' }
        const body = { email, password }
        return this.http.post(`${environment.ENDPOINT}/api/user/login`, body, { 'headers': headers })
    }
    
    public getMe(jwt: String) {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        return this.http.get(`${environment.ENDPOINT}/api/user/me`, { 'headers': headers })
    }

    public getUserById(jwt: String, userId: string) {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        return this.http.get(`${environment.ENDPOINT}/api/user/id/${userId}`, { 'headers': headers })
    }

    public getAll(jwt: string) {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        return this.http.get(`${environment.ENDPOINT}/api/user`, { 'headers': headers })
    }

    public addRole(jwt: string, userId: string, roles: string) {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        const body = { userId, roles }
        return this.http.put(`${environment.ENDPOINT}/api/user/addRoles`, body, { 'headers': headers })
    }

    public confirmEmail(jwt: string) {
        const headers = { 'Content-Type': 'application/json'}
        return this.http.get(`${environment.ENDPOINT}/api/user/confirm/${jwt}`, { 'headers': headers })   
    }

    public deleteUser(jwt: string, userId: string) {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        return this.http.delete(`${environment.ENDPOINT}/api/user/${userId}`, { 'headers': headers })   
    }

    public logout(): void {
        localStorage.removeItem('jwt')
        window.location.href="/"
    }
}
