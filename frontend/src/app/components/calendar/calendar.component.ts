import { AfterViewInit, Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SocketIoService } from 'src/app/services/socket-io/socket-io.service';
import { Menu } from 'src/app/utils/menu.inteface';
import { CreateMenuDialogComponent } from '../create-menu-dialog/create-menu-dialog.component';
import { MenuDialogComponent } from '../menu-dialog/menu-dialog.component';
import { Day } from 'src/app/utils/day.interface';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit {
    loading: boolean = true
    menues: Array<Menu> = []
    rol!: number
    myId!: string                       // ID DEL USUARIO LOGUEADO
    canBeAddedToMenu: boolean = false   // PUEDE AGREGARSE AL MENÚ
    canManageMenus: boolean = false     // PUEDE ADMINISTAR MENUS
    canAddMenus: boolean = false

    months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
        "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    date!: Date
    currentDate!: Date
    currentDateText!: string
    currYear!: number
    currMonth!: number
    actualMonth!: boolean                // ES EL MES ACTUAL?

    lastDateOfMonth!: Date
    lastDayOfMonth!: Date
    lastDateOfLastMonth!: Date
    firstDayOfMonth!: Date
    calendarPC: Array<Day> = []
    calendarMovil: Array<Day> = []

    @ViewChildren('listOfDays') private listOfDays!: QueryList<any>

    constructor(
        private authService: AuthService,
        public dialog: MatDialog,
        public socketIoService: SocketIoService,
        @Inject(DOCUMENT) private document: any,
    ) {
        this.date = new Date()
        this.currYear = this.date.getFullYear()
        this.currMonth = this.date.getMonth()
        this.actualMonth = this.date.getMonth() == this.currMonth

        socketIoService.requestMenusOfMonth(this.currMonth + 1)

        socketIoService.getMenu((menus: Array<Menu>) => {
            this.menues = menus
            this.constructCalendar()
        })

        socketIoService.loadMenus(() => {
            socketIoService.requestMenusOfMonth(this.currMonth + 1)
        })
    }
    
    ngAfterViewInit(): void {
        this.listOfDays.changes.subscribe(() => {
            if (this.actualMonth) {
                setTimeout(() => {
                    this.scrollToToday()
                }, 0);
            }
            if (!this.actualMonth) this.scrollToTop()
        })
    }

    ngOnInit(): void {
        this.authService.user$.subscribe(user => {
            const userRol = user.rol
            this.rol = userRol
            this.canAddMenus = userRol >= 0 && userRol < 2
            this.myId = user._id
            this.canBeAddedToMenu = user.rol >= 0
            this.canManageMenus = user.rol >= 0 && user.rol < 2
        })
    }

    toggleLoading() {
        this.loading = false
    }

    public openDialog(menu: Menu) {
        const dialogRef = this.dialog.open(MenuDialogComponent, {
            data: {
                menu,
                mySelectedMenu: menu.users?.find(user => user._id == this.myId)?.Menu_User?.selectedMenu,
            },
            width: "100%"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) this.constructCalendar()
        })
    }

    getDayName(day: Date) {
        return ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'][day.getDay()]
    }

    public constructCalendar() {
        this.calendarPC = []
        this.calendarMovil = []
        this.firstDayOfMonth = new Date(this.currYear, this.currMonth, 1)
        this.lastDateOfMonth = new Date(this.currYear, this.currMonth + 1, 0)
        this.lastDayOfMonth = new Date(this.currYear, this.currMonth, this.lastDateOfMonth.getDate())
        this.lastDateOfLastMonth = new Date(this.currYear, this.currMonth, 0)

        const numberOfFirstDayofMont = this.firstDayOfMonth.getDay(),           // NÚMERO DEL PRIMER DÍA DE LA SEMANA DEL MES
            numberOfLastDateOfMonth = this.lastDateOfMonth.getDate(),           // NÚMERO DEL ULTIMO DIA DEL MES
            numberOfLastDayOfMonth = this.lastDayOfMonth.getDay(),              // NÚMERO DE LA SEMANA DEL ULTIMO DÍA DEL MES
            numberOfLastDateOfLastMonth = this.lastDateOfLastMonth.getDate()    // NÚMERO DEL ULTIMO DIA DEL ULTIMO MES

        for (let i = numberOfFirstDayofMont; i > 0; i--) {
            const day = numberOfLastDateOfLastMonth - i + 1
            const thisDay = new Date(this.currYear, this.lastDateOfLastMonth.getMonth(), day)

            const dayInfo: Day = {
                dayInfo: thisDay,
                dayName: '',
                status: -1, //inactivo
                menu: undefined,
                isWeekend: false,
                validToAdd: false
            }
            this.calendarPC.push(dayInfo)
        }

        for (let i = 1; i <= numberOfLastDateOfMonth; i++) {
            const menu = this.checkMenu(i)

            const isToday = i === this.date.getDate()
                && this.currMonth === new Date().getMonth()
                && this.currYear === new Date().getFullYear()
            const status = isToday ? 0 : i == 1 ? 2 : i == numberOfLastDateOfMonth ? 3 : 1

            const day = new Date(this.currYear, this.currMonth, i).getDay()
            const dayInfo = new Date(this.currYear, this.currMonth, i)

            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            tomorrow.setHours(0, 0, 0, 0)

            const isWeekend = day == 0 || day == 6
            const validToAdd = !isWeekend && +new Date(this.currYear, this.currMonth, i) >= +tomorrow

            const dayName = this.getDayName(dayInfo)
            const thisDayInfo: Day = {
                dayInfo,
                dayName,
                status,
                menu,
                isWeekend,
                validToAdd
            }

            this.calendarPC.push(thisDayInfo)
            this.calendarMovil.push(thisDayInfo)
        }

        for (let i = numberOfLastDayOfMonth; i < 6; i++) {
            const day = i - numberOfLastDayOfMonth + 1
            const thisDay = new Date(this.currYear, this.currMonth, day)

            const dayInfo: Day = {
                dayInfo: thisDay,
                dayName: '',
                status: -1, // inactivo
                menu: undefined,
                isWeekend: false,
                validToAdd: false
            }

            this.calendarPC.push(dayInfo)
        }

        this.currentDateText = `${this.months[this.currMonth]} ${this.currYear}`
        this.currentDate = new Date(this.currYear, this.currMonth)
        this.toggleLoading()
    }

    public prevNextMonth(evt: any) {
        const option = evt.target.id
        this.currMonth = option === 'prev' ? this.currMonth - 1 : this.currMonth + 1

        if (this.currMonth < 0 || this.currMonth > 11) {
            const newDate = new Date(this.currYear, this.currMonth)
            this.currYear = newDate.getFullYear()
            this.currMonth = newDate.getMonth()
        }

        this.socketIoService.requestMenusOfMonth(this.currMonth + 1)
        this.actualMonth = this.date.getMonth() == this.currMonth
        this.constructCalendar()
    }

    scrollToTop () {
        this.document.querySelector('.calendar').scrollTop = 0
    }

    scrollToToday () {
        this.document.querySelector('#today').scrollIntoView()
    }

    private checkMenu(day: number) {
        const date = new Date(this.currYear, this.currMonth, day)

        return this.menues.find(menu =>
            new Date(new Date(menu.date).setHours(0)).getTime() === date.getTime()
        )
    }

    public addMenu(day: number) {
        const date = new Date(this.currYear, this.currMonth, day).getTime()
        const dialogRef = this.dialog.open(CreateMenuDialogComponent, {
            data: {
                date
            }
        })
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.constructCalendar()
            }
        })
    }
}
