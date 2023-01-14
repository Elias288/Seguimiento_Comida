import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    ENDPOINT = 'http://localhost:8080/api'
    constructor() { }

    getAllMenues() {
        const data = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }, 
        }

        return fetch(`${this.ENDPOINT}/menu`, data).then(data => {
            return data
        }).catch(err => {
            return err
        })
    }
}
