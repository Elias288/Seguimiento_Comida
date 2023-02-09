export interface User {
    _id: string
    name: string
    surName: string | null | undefined
    email: string
    password: string
    password2: string
    roles: string[]
    Menu_User: Menu_User | undefined
    emailVerified: number | undefined
}

interface Menu_User {
    selectedMenu: string
    userId: string
    menuId: string
}