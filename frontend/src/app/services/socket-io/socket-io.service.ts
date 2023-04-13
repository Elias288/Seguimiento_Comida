import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Menu } from 'src/app/utils/menu.inteface';
import { User } from 'src/app/utils/user.interface';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SocketIoService {
    socket: any

    constructor() {
        this.socket = io(environment.ENDPOINT)
    }

    public getWebSocketError = (callback: any) => {
        this.socket.on('server:error', callback)
    }

    public getMenues = (callback: any) => {
        this.socket.on('server:loadMenues', callback)
    }

    public getNotifications = (callback: any) => {
        this.socket.on('server:notifications', callback)
    }

    public getNewNotification = (callback: any) => {
        this.socket.on('server:newNotification', callback)
    }

    public getNewMenu = (callback: any) => {
        this.socket.on('server:newMenu', callback);
    }

    public getAddedMenu = (callback: any) => {
        this.socket.on('server:addedMenu', callback)
    }

    public getDeletedMenu = (callback: any) => {
        this.socket.on('server:deletedMenu', callback)
    }

    public getUpdatedMenu = (callback: any) => {
        this.socket.on('server:updatedMenu', callback)
    }

    public getDeletedToMenu = (callback: any) => {
        this.socket.on('server:deletedToMenu', callback)
    }

    public joinToRoom = (userRol: string) => {
        this.socket.emit('client:joinToRoom', userRol)   
    }

    public requestMenues = () => {
        this.socket.emit('client:requestMenues', )
    }
    
    // public requestNotifications = (userId: string, userRol: number) => {
    //     this.socket.emit('client:requestPersonalNotifications', { userId, userRol })
    // }

    public newUser = (userId: string, email: string) => {
        this.socket.emit('client:newUser', { userId, email })
    }
    
    public newMenu = (token: string, menu: Menu) => {
        this.socket.emit('client:newMenu', { token, menu })
    }

    public deleteMenu = (token: string, menuId: string) => {
        this.socket.emit('client:deleteMenu', { token, menuId })
    }

    public updateMenu = (token: string, menu: Menu) => {
        this.socket.emit('client:updateMenu', { token, menu })
    }

    public addToMenu = (token: string, menuId: string, selectedMenu: string, entryDate: Date) => {
        this.socket.emit('client:addToMenu', { token, menuId, selectedMenu, entryDate })
    }

    public dropToMenu = (token: string, menuId: string, dropDate: Date) => {
        this.socket.emit('client:deleteToMenu', { token, menuId, dropDate })
    }

    public notifyRoleChanged = (receptorId: string, newRol: string) => {
        this.socket.emit('client:notifyRoleChanged', { receptorId, newRol, createdTime: new Date()  })
    }

    // public requestRol = (token: string, emisor: User) => {
    //     this.socket.emit('client:requestRol', { token, emisor })
    // }
}
