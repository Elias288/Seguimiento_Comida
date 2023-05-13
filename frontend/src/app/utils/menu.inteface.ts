import { User } from "./user.interface"

export interface Menu {
    _id: string
    menuPrincipal: string,
    menuSecundario: string,
    date: Date,
    users: Array<User> | undefined
    Menu_Users?: Menu_User
}

interface Menu_User {
    selectedMenu: string,
    entryDate: Date,
    userId: string,
    menuId: string
}
