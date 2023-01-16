import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Menu } from 'src/app/utils/menu.inteface';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    ENDPOINT = 'http://localhost:8080/api'
    constructor(
        private http: HttpClient,
    ) { }

    public create(menuData: Menu, jwt: string){
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        const body = JSON.stringify(menuData)
        return this.http.post(this.ENDPOINT + '/menu', body, { 'headers': headers })
    }

    public getAllMenues() {
        const headers = { 'Content-Type': 'application/json' }
        return this.http.get(this.ENDPOINT + '/menu', { 'headers': headers })
    }
}
