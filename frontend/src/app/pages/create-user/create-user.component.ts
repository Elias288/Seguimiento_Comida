import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/utils/user.interface';

@Component({
    selector: 'app-create-user',
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit{
    createUserForm!: FormGroup
    userData: User = {
        _id: "",
        name: "",
        surName: "",
        email: "",
        password: "",
        password2: "",
        kitchener: false,
        admin: false,
    }

    constructor(
        private userService: UserService
    ) { }
    
    ngOnInit(): void {
        this.createUserForm = new FormGroup({
            name: new FormControl(this.userData.name, [
                Validators.required,
                Validators.minLength(3),
            ]),
            surName: new FormControl(this.userData.surName),
            email: new FormControl(this.userData.email, [
                Validators.required,
                Validators.minLength(3),
            ]),
            password: new FormControl(this.userData.password, [
                Validators.required,
                Validators.minLength(3),
            ]),
            password2: new FormControl(this.userData.password2, [
                Validators.required,
                Validators.minLength(3),
            ]),
        })
    }

    async onSubmit(): Promise<void> {
        this.userData.email = this.createUserForm.controls['email'].value
        this.userData.surName = this.createUserForm.controls['surName'].value
        this.userData.name = this.createUserForm.controls['name'].value
        this.userData.password = this.createUserForm.controls['password'].value
        this.userData.password2 = this.createUserForm.controls['password2'].value
        
        const data = await this.userService.create(this.userData)
        console.log(data)
        if (data.error) {
            window.alert(data.error.message)
        }
        
    }
}
