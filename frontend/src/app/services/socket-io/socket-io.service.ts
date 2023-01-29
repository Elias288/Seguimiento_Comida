import { EventEmitter, Injectable } from '@angular/core';
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

    public loadMenues = (callback: any) => {
        this.socket.on('server:loadMenues', callback)
    }

    public newMenu = (menu: Menu, token: string) => {
        this.socket.emit('client:newMenu', { token, menu })
    }

    public onNewMenu = (callback: any) => {
        this.socket.on('server:newMenu', callback);
    }
}
