import { Component } from '@angular/core'
import { Router } from '@angular/router'

@Component({
    selector: 'app-helps',
    templateUrl: './helps.component.html',
    styleUrls: ['./helps.component.scss']
})
export class HelpsComponent {
    isMenuOpen: Boolean = false
    loading: boolean = true
    
    constructor(
        private router: Router,
    ){
        setTimeout(() => {
            this.toggleLoading()
        }, 500);
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
