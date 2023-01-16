import { Component, Input, OnInit } from '@angular/core';
import { Menu } from 'src/app/utils/menu.inteface';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit{
    @Input() menues!: Menu[]
    months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", 
        "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" 
    ]
    date!: Date
    currYear!: number 
    currMonth!: number 

    numbersDay!: {day: number, status: string}[]
    currentDate!: string
    lastDateOfMonth!: number 
    lastDayOfMonth!: number 
    lastDateOfLastMonth!: number 
    firstDayOfMonth!: number

    constructor () {
        this.date = new Date()
        this.currYear = this.date.getFullYear()
        this.currMonth = this.date.getMonth()
        this.constructCalendar()
    }

    ngOnInit(): void {
    }

    constructCalendar() {

        this.numbersDay = []
        this.firstDayOfMonth = new Date(this.currYear, this.currMonth, 1).getDay()
        this.lastDateOfMonth = new Date(this.currYear, this.currMonth + 1, 0).getDate()
        this.lastDayOfMonth = new Date(this.currYear, this.currMonth, this.lastDateOfMonth).getDay()
        this.lastDateOfLastMonth = new Date(this.currYear, this.currMonth, 0).getDate()
        
        for(let i = this.firstDayOfMonth; i > 0; i--) {
            this.numbersDay.push({day: this.lastDateOfLastMonth - i + 1, status: 'inactive'})
        }
        for(let i = 1; i <= this.lastDateOfMonth; i++) {
            const isToday = i === this.date.getDate() 
                && this.currMonth === new Date().getMonth() 
                && this.currYear === new Date().getFullYear() ? 'active' : ''

            this.numbersDay.push({ day: i, status: isToday})
        }
        for(let i = this.lastDayOfMonth; i < 6; i++) {
            this.numbersDay.push({ day: i - this.lastDayOfMonth + 1, status: 'inactive' })
        }

        this.currentDate = `${this.months[this.currMonth]} ${this.currYear}`
    }

    prevNextMonth(evt: any) {
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
}
