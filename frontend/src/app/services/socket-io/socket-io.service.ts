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

    public getWebSocketError = (callback: any) => {
        this.socket.on('server:error', callback)
    }

    public getIsConnected = (callback: any) => {
        this.socket.on('server:IsConnected', callback)
    }

    public getOnlineUsers = (callback: any) => {
        this.socket.on('server:onlineUsers', callback)
    }

    public getMenu = (callback: any) => { //RECIBE LOS MENUS DEL BACKEND
        this.socket.on('server:menus', callback)
    }

    public getMenusOfUser = (callback: any) => { //RECIBE LOS MENUS DEL CLIENTE
        this.socket.on('server:loadMenusOfUser', callback)
    }

    public loadMenus = (callback: any) => { //ORDENA AL FRONTEND SOLICITAR TODOS LOS MENUS
        this.socket.on('server:loadMenus', callback)
    }

    public getNotifications = (callback: any) => {
        // El servidor pide que se actualice las notificaciones
        this.socket.on('server:requestNotifications', callback)
    }

    public notifications = (callback: any) => {
        this.socket.on('server:notifications', callback)
    }

    public getNewNotification = (callback: any) => {
        this.socket.on('server:newNotification', callback)
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

    public requestMenus = () => { //FRONTEND SOLICITA TODOS LOS MENUS
        this.socket.emit('client:requestMenus',)
    }

    public requestMenusOfMonth = (month: number) => { //FRONTEND SOLICITA MENUS DEL MES
        this.socket.emit('client:requestMenusOfMonth', { month })
    }

    public requestRol = () => {
        this.socket.emit('client:requestRol', { createdTime: new Date() })
    }

    public requestNotifications = (userId: string) => {
        this.socket.emit('client:requestNotifications', { userId })
    }

    public activeNotification = (notificationId: string, userId: string) => {
        this.socket.emit('client:activeNotification', { notificationId, userId })
    }

    public deleteNotification = (notificationId: string, userId: string) => {
        this.socket.emit('client:deleteNotification', { notificationId, userId })
    }

    public isConnected = () => {
        this.socket.emit('client:isConnected')
    }

    public newUser = (userId: string, email: string, userRol: number) => {
        this.socket.emit('client:newUser', { userId, email, userRol })
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
        this.socket.emit('client:notifyRoleChanged', { receptorId, newRol, createdTime: new Date() })
    }

    public requestMenusOfUser = (token: string, userId: string) => {
        this.socket.emit('client:requestMenusByUserId', { token, userId })
    }
}
