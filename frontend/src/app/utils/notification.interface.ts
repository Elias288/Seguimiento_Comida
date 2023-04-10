export interface Notification {
    _id: string
    name: string
    message: string
    emisor: string
    receptor: string
    receptorRole: string
    active: boolean
}