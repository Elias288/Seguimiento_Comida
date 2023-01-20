export interface User {
    _id: string | null | undefined
    name: string | null | undefined
    surName: string | null | undefined
    email: string | null | undefined
    password: string | null | undefined
    password2: string | null | undefined
    roles: string[]
    Menu_User: Menu_User | undefined
}

interface Menu_User {
    selectedMenu: string
    userId: string
    menuId: string
}