export interface User {
    _id: string
    name: string
    surName?: string
    email: string
    password: string
    password2: string
    rol: number
    rolName?: string
    Menu_User?: Menu_User
    emailVerified?: number
    online?: Boolean
}

interface Menu_User {
    selectedMenu: string
    userId: string
    menuId: string
    entryDate: Date
}