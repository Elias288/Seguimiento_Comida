import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuService } from 'src/app/services/menu/menu.service';
import { Menu } from 'src/app/utils/menu.inteface';

interface Day {
    numberDay: number
    status: string
    menu: Menu | undefined
    isWeekend: boolean
    validToAdd: boolean
}

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit{
    menues!: Menu[]
    roles!: string[]

    months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", 
        "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" 
    ]
    date!: Date
    currYear!: number 
    currMonth!: number 

    numbersDay!: Array<Day>
    currentDate!: string
    lastDateOfMonth!: number 
    lastDayOfMonth!: number 
    lastDateOfLastMonth!: number 
    firstDayOfMonth!: number

    constructor (
        private menuService: MenuService,
        private authService: AuthService,
        private router: Router,
    ) {
        this.date = new Date()
        this.currYear = this.date.getFullYear()
        this.currMonth = this.date.getMonth()
        this.menuService.getAllMenues().subscribe({
            next: (v) => {
                this.menues = v as Array<Menu>
                this.constructCalendar()
            }
        })

        authService.isLoggedIn$.subscribe(status => {
            if (status) {
                this.authService.getUser().subscribe({
                    next: (v) => {
                        this.roles = v.roles
                    }
                })
            }
        })
    }

    ngOnInit(): void {
    }

    private constructCalendar() {
        this.numbersDay = []
        this.firstDayOfMonth = new Date(this.currYear, this.currMonth, 1).getDay()
        this.lastDateOfMonth = new Date(this.currYear, this.currMonth + 1, 0).getDate()
        this.lastDayOfMonth = new Date(this.currYear, this.currMonth, this.lastDateOfMonth).getDay()
        this.lastDateOfLastMonth = new Date(this.currYear, this.currMonth, 0).getDate()
        
        for(let i = this.firstDayOfMonth; i > 0; i--) {
            const day = this.lastDateOfLastMonth - i + 1
            this.numbersDay.push({
                numberDay: day,
                status: 'inactive',
                menu: undefined,
                isWeekend: false,
                validToAdd: false
            })
        }

        for(let i = 1; i <= this.lastDateOfMonth; i++) {
            const menu = this.checkMenu(i)

            const isToday = i === this.date.getDate() 
                && this.currMonth === new Date().getMonth() 
                && this.currYear === new Date().getFullYear() ? 'active' : ''

            const day = new Date(this.currYear, this.currMonth, i).getDay()
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const validToAdd = +new Date(this.currYear, this.currMonth, i) > +tomorrow

            this.numbersDay.push({
                numberDay: i,
                status: isToday,
                menu,
                isWeekend: day == 0 || day == 6,
                validToAdd
            })
        }
        for(let i = this.lastDayOfMonth; i < 6; i++) {
            const day = i - this.lastDayOfMonth + 1
            this.numbersDay.push({
                numberDay: day,
                status: 'inactive',
                menu: undefined,
                isWeekend: false,
                validToAdd: false
            })
        }

        this.currentDate = `${this.months[this.currMonth]} ${this.currYear}`
    }

    public prevNextMonth(evt: any) {
        const option = evt.target.id
        this.currMonth = option === 'prev' ? this.currMonth -1 : this.currMonth + 1
        
        if (this.currMonth < 0 || this.currMonth > 11) {
            this.date = new Date(this.currYear, this.currMonth)
            this.currYear = this.date.getFullYear()
            this.currMonth = this.date.getMonth()
        } else {
            this.date = new Date()
        }

        this.constructCalendar()
    }

    private checkMenu(day: number) {
        const date = new Date(this.currYear, this.currMonth, day, 0,0,0)
        return this.menues.find(menu => new Date(menu.date).getTime() === date.getTime())
    }

    public addMenu(day: any) {
        const date = new Date(this.currYear, this.currMonth, day).getTime()
        this.router.navigate(['create/menu', date])
    }
}
