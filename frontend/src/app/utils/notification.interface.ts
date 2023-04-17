export interface Notification {
    _id?: string
    notificationTitle: string
    message: string
    emisorSocketId: string
    receptorSocketId: string
    receptorRol?: string
    active: boolean
    createdTime: Date | string
}