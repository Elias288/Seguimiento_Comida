import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    constructor(
        private menuService: MenuService,
        private authService: AuthService,
        private _snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.menuData= new FormGroup({
            menuPrincipal: new FormControl<string>("", [
                Validators.required,
                Validators.minLength(3),
            ]),
            menuSecundario: new FormControl<string>("", []),
            fecha: new FormControl('', [
                Validators.required,
            ])
        })
    }
    

    onSubmit(): void {
        const { menuPrincipal, menuSecundario, fecha } = this.menuData.value
        const menu: Menu = { _id: undefined, menuPrincipal, menuSecundario, date: fecha }
        
        this.menuService.create(menu, this.authService.token).subscribe({
            next: (v) => this._snackBar.open('Menu creado exitosamente', 'close', { duration: 5000 }),
            error: (e) => this._snackBar.open(e.error.message, 'close', { duration: 5000 }),
            complete: () => {
                this.menuData.reset()
            }
        })
    }
}
