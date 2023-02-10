import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SocketIoService } from 'src/app/services/socket-io/socket-io.service';
import { Menu } from 'src/app/utils/menu.inteface';
import { CreateMenuDialogComponent } from '../create-menu-dialog/create-menu-dialog.component';
import { MenuDialogComponent } from '../menu-dialog/menu-dialog.component';

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
    menues: Array<Menu> = []
    roles!: string[]

    months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", 
        "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" 
    ]
    date!: Date
    currYear!: number 
    currMonth!: number 

    numbersDay: Array<Day> = []
    currentDate!: string
    lastDateOfMonth!: number 
    lastDayOfMonth!: number 
    lastDateOfLastMonth!: number 
    firstDayOfMonth!: number

    constructor (
        private authService: AuthService,
        public dialog: MatDialog,
        public socketIoService: SocketIoService,
        private _snackBar: MatSnackBar,
    ) {
        this.date = new Date()
        this.currYear = this.date.getFullYear()
        this.currMonth = this.date.getMonth()

        authService.isLoggedIn$.subscribe(status => {
            if (status) {
                this.authService.getUser().subscribe({
                    next: (v) => {
                        this.roles = v.roles
                    }
                })
            }
        })

        socketIoService.loadMenues((menu: Array<Menu>) => {
            this.menues = menu
            this.constructCalendar()
        })

        socketIoService.onNewMenu((menu: Menu) => {
            this.menues.push(menu)
            this.constructCalendar()
        })
        
        socketIoService.webSocketError((data: any) => {
            this._snackBar.open(data.message, 'close', { duration: 5000 })
        })
    }

    ngOnInit(): void {
    }

    public openDialog(day: Day) {
        const dialogRef = this.dialog.open(MenuDialogComponent, {
            data : {
                roles: this.roles,
                day,
                completeDate: new Date(this.currYear, this.currMonth, day.numberDay),
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) this.constructCalendar()
        })
    }

    public constructCalendar() {
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
                && this.currYear === new Date().getFullYear()

            const day = new Date(this.currYear, this.currMonth, i).getDay()
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const validToAdd = +new Date(this.currYear, this.currMonth, i) > +tomorrow

            this.numbersDay.push({
                numberDay: i,
                status: isToday ? 'today': '',
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
            const newDate = new Date(this.currYear, this.currMonth)
            this.currYear = newDate.getFullYear()
            this.currMonth = newDate.getMonth()
        }

        this.constructCalendar()
    }

    private checkMenu(day: number) {
        const date = new Date(this.currYear, this.currMonth, day, 0,0,0)
        return this.menues.find(menu => new Date(menu.date).getTime() === date.getTime())
    }

    public addMenu(day: any) {
        const date = new Date(this.currYear, this.currMonth, day).getTime()
        const dialogRef = this.dialog.open(CreateMenuDialogComponent, {
            data : {
                date
            }
        })
        dialogRef.afterClosed().subscribe(result => {
            if (result) this.constructCalendar()
        })
    }
}
