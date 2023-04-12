import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-entry-page',
    templateUrl: './entry-page.component.html',
    styleUrls: ['./entry-page.component.scss']
})
export class EntryPageComponent implements OnInit{
    routePaht: boolean = true

    constructor(
        private location: Location
    ){}

    ngOnInit(): void {
        this.routePaht = this.location.path() == '/login'
    }
}
