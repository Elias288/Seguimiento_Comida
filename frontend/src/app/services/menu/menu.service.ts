import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Menu } from 'src/app/utils/menu.inteface';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    constructor(
        private http: HttpClient,
    ) { 
        // console.log('production:', environment.production)
    }

    public create(menuData: Menu, jwt: string){
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        const body = JSON.stringify(menuData)
        return this.http.post(environment.apiUrl + '/menu', body, { 'headers': headers })
    }

    public getAllMenues() {
        const headers = { 'Content-Type': 'application/json' }
        return this.http.get(environment.apiUrl + '/menu', { 'headers': headers })
    }

    public updateMenu(jwt: string, menu: Menu) {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        const body = JSON.stringify( menu )
        return this.http.put(environment.apiUrl + '/menu', body, { 'headers': headers })
    }

    public deleteMenu(menuId: string, jwt: string) {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` }
        const body = JSON.stringify({ id: menuId})
        return this.http.delete(environment.apiUrl + `/menu/${menuId}`, { 'headers': headers })
    }
}
