import { User } from "./user.interface"

export interface Menu {
    _id: string
    menuPrincipal: string, 
    menuSecundario: string, 
    date: Date,
    users: Array<User> | undefined
}
