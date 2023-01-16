export interface User {
    _id: string | null | undefined
    name: string | null | undefined
    surName: string | null | undefined
    email: string | null | undefined
    password: string | null | undefined
    password2: string | null | undefined
    roles: string[]
}
