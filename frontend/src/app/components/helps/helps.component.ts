import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
    selector: 'app-helps',
    templateUrl: './helps.component.html',
    styleUrls: ['./helps.component.scss']
})
export class HelpsComponent implements OnInit{
    isMenuOpen: Boolean = false
    loading: boolean = true
    
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ){
        this.toggleLoading()
    }
    ngOnInit(): void {
        this.activatedRoute.fragment.subscribe((value) => {
            value && this.jumpTo(value)
        })
    }

    jumpTo(section: string) {
        document.getElementById(section)?.scrollIntoView({ behavior:'smooth' })
    }

    toggleLoading() {
        this.loading = !this.loading
    }

    public toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen
    }

    public goToSection(section: string) {
        this.toggleMenu()
        this.router.navigate(['/helps'], { fragment: section })
    }
}
