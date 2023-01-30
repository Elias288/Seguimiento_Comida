import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Menu } from 'src/app/utils/menu.inteface';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SocketIoService {
    socket: any

    constructor() {
        this.socket = io(environment.ENDPOINT)
    }

    public webSocketError = (callback: any) => {
        this.socket.on('server:error', callback)
    }

    public loadMenues = (callback: any) => {
        this.socket.on('server:loadMenues', callback)
    }

    public onNewMenu = (callback: any) => {
        this.socket.on('server:newMenu', callback);
    }

    public addedMenu = (callback: any) => {
        this.socket.on('server:addedMenu', callback)
    }

    public deletedMenu = (callback: any) => {
        this.socket.on('server:deletedMenu', callback)
    }

    public updatedMenu = (callback: any) => {
        this.socket.on('server:updatedMenu', callback)
    }

    public deletedToMenu = (callback: any) => {
        this.socket.on('server:deletedToMenu', callback)
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

    public addToMenu = (token: string, menuId: string, selectedMenu: string) => {
        this.socket.emit('client:addToMenu', { token, menuId, selectedMenu })
    }

    public dropToMenu = (token: string, menuId: string) => {
        this.socket.emit('client:deleteToMenu', { token, menuId })
    }
}
