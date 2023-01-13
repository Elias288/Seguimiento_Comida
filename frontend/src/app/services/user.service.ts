import { Injectable } from '@angular/core';
import { User } from '../utils/user.interface'

@Injectable({
    providedIn: 'root'
})
export class UserService {
    ENDPOINT = 'http://localhost:8080/api'
    constructor() { }

    get user() {
        if (this.isLoggedIn) {
        return JSON.parse(localStorage.getItem('user')!)
        }
        throw new Error("User not found")
    }

    get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user')!)
        return user !== null ? true : false
    }

    create(userData: User) {
        const {name , surName, email, password, password2, kitchener, admin} = userData
        const data = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                surName,
                email,
                password,
                password2,
                kitchener,
                admin
            })
        }

        return fetch(`${this.ENDPOINT}/user`, data).then(res => {
            return res.json()
        }).then(data => {
            if (!data.error) {
                localStorage.setItem('user', JSON.stringify(data))
            }
            return data
        }).catch(err => {
            return err
        })
    }

    login(email: String, password: String) {
        const data = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        }

        return fetch(`${this.ENDPOINT}/user/login`, data).then(res => {
            return res.json()
        }).then(data => {
            if (!data.error) {
                localStorage.setItem('user', JSON.stringify(data))
            }
            return data
        }).catch(err => {
            return err
        })
    }
}
