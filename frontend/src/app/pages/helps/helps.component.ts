import { Component } from '@angular/core'
import { Router } from '@angular/router'

@Component({
    selector: 'app-helps',
    templateUrl: './helps.component.html',
    styleUrls: ['./helps.component.scss']
})
export class HelpsComponent {
    isMenuOpen: Boolean = false
    
    constructor(
        private router: Router,
    ){}

    public toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen
    }

    public goToSection(section: string) {
        this.toggleMenu()
        this.router.navigate(['/helps'], { fragment: section })
    }
}
