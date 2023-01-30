import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent {
    loading: boolean = true
    confirmed: boolean = false
    error: boolean = false

    constructor(
        private activatedRoute: ActivatedRoute,
        private userService: UserService,
        private router: Router,
    ) { 
        this.activatedRoute.params.subscribe((params) => {
            console.log(params['token']);
            
            userService.confirmEmail(params['token']).subscribe({
                next: () => {
                    setTimeout(() => {
                        this.loading = false
                        this.confirmed = true
                    }, 1000)
                },
                error: () => {
                    this.loading = false
                    this.error = true
                }
            })
        })
    }

    public goToLogin() {
        this.router.navigate(['/login'])
    }
}
