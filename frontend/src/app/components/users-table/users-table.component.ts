import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from 'src/app/services/user/user.service';
import { User } from 'src/app/utils/user.interface';

interface todo {
    def: string,
    label: string, 
    hide: boolean | undefined
}

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.scss']
})
export class UsersTableComponent implements OnInit{
    @Input() hasActions!: boolean | undefined
    @Input() actionsFunctions!: Array<any>
    @Input() myId!: string
    @Input() jwt!: string
    @Output() actions: EventEmitter<object> = new EventEmitter<object>()
    ROLES = [
        'ADMIN',     
        'COCINERO',  
        'COMENSAL',  
        '',
        ''           
    ]
    loading: boolean = true
    usuarios!: Array<User>
    dataSource!: MatTableDataSource<User>
    columsDefinitions!: Array<todo>

    getDisplayedColumns(): string[] {
        return this.columsDefinitions.filter(cd => cd.hide).map(cd => cd.def)
    }

    constructor (
        private userService: UserService,
    ) { }

    ngOnInit(): void {
        this.updateUsers()

        this.columsDefinitions = [
            { def: 'name', label: 'name', hide: true },
            { def: 'email', label: 'email', hide: true },
            { def: 'rol', label: 'rol', hide: true },
            { def: 'actions', label: 'actions', hide: this.hasActions},
        ]
    }

    toggleLoading() {
        this.loading = false
    }

    public updateUsers() {
        this.userService.getAll(this.jwt).subscribe({
            next: (v) => {
                const allUsers = v as Array<User>
                this.usuarios = allUsers.sort((a) => {
                    return a._id == this.myId ? -1 : 0
                })
                this.usuarios.map(u => u.rol = this.ROLES[parseInt(u.rol)])

                this.toggleLoading()
                // setTimeout(() => {
                // }, 1000);
            },
            error: (e) => {
                console.error(e);
            }
        })
    }

    sendInfo(user: any, option: string) {
        this.actions.emit({
            user, 
            option
        })
    }
}
