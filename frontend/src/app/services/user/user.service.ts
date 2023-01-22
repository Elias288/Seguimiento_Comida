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
        return this.http.post(`${environment.apiUrl}/user`, body, { 'headers': headers })
    }
    
    public login(email: String, password: String): Observable<Object> {
        const headers = { 'Content-Type': 'application/json' }
        const body = { email, password }
        return this.http.post(`${environment.apiUrl}/user/login`, body, { 'headers': headers })
    }
    
    public getMe(jwt: String) {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        return this.http.get(`${environment.apiUrl}/user/me`, { 'headers': headers })
    }

    public getAll(jwt: string) {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        return this.http.get(`${environment.apiUrl}/user`, { 'headers': headers })
    }

    public addRole(jwt: string, userId: string, roles: string) {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        const body = { userId, roles }
        return this.http.put(`${environment.apiUrl}/user/addRoles`, body, { 'headers': headers })
    }
    
    public addToMenu(jwt: string, menuId: string, selectedMenu: string) {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        const body = { menuId, selectedMenu }
        return this.http.post(`${environment.apiUrl}/user/menu`, body, { 'headers': headers })
    }

    public removeToMenu(jwt: string, menuId: string) {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        const body = { menuId }
        return this.http.delete(`${environment.apiUrl}/user/menu/` + menuId, { 'headers': headers })   
    }

    public logout(): void {
        localStorage.removeItem('jwt')
        window.location.href="/"
    }
}
