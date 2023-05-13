import { Menu } from "./menu.inteface"

export interface Day {
    dayInfo: Date
    dayName?: string
    status?: string
    menu?: Menu
    isWeekend: boolean
    validToAdd: boolean
}