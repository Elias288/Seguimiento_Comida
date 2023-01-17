import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuService } from 'src/app/services/menu/menu.service';
import { Menu } from 'src/app/utils/menu.inteface';

@Component({
    selector: 'app-create-menu',
    templateUrl: './create-menu.component.html',
    styleUrls: ['./create-menu.component.scss']
})
export class CreateMenuComponent implements OnInit{
    menuData!: FormGroup
    fecha!: Date

    constructor(
        private menuService: MenuService,
        private authService: AuthService,
        private activatedRoute: ActivatedRoute,
        private _snackBar: MatSnackBar,
    ) {
        activatedRoute.params.subscribe((params) => {
            if (params['fechaId'] != 0)
                this.fecha = new Date(parseInt(params['fechaId'] as string, 10)) 
        })
    }

    ngOnInit(): void {

        this.menuData= new FormGroup({
            menuPrincipal: new FormControl<string>("", [
                Validators.required,
                Validators.minLength(3),
            ]),
            menuSecundario: new FormControl<string>("", []),
            date: new FormControl(this.fecha, [
                Validators.required,
            ])
        })
    }
    

    onSubmit(): void {
        const { menuPrincipal, menuSecundario, date } = this.menuData.value
        const menu: Menu = { _id: undefined, menuPrincipal, menuSecundario, date }
        
        if (this.menuData.invalid) {
            this.menuData.markAllAsTouched()
        } else {
            this.menuService.create(menu, this.authService.token).subscribe({
                next: (v) => this._snackBar.open('Menu creado exitosamente', 'close', { duration: 5000 }),
                error: (e) => this._snackBar.open(e.error.message, 'close', { duration: 5000 }),
                complete: () => {
                   this.menuData.reset()
                }
            })
        }
    }
}
