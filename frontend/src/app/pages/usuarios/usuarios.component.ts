import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit{
    roles!: string[]
    admin!: boolean

    constructor (
        public authService: AuthService,
    ) { 
        authService.isLoggedIn$.subscribe(status => {
            if (status) {
                this.authService.getUser().subscribe({
                    next: (v) => {
                        this.roles = v.roles
                        this.admin = v.roles.includes('ADMIN')
                    }
                })
            }
        })
    }

    ngOnInit(): void {
        
    }

    getUser(res: object) {
        console.log(res);
        
    }
}
