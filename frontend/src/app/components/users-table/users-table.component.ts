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

    public updateUsers() {
        this.userService.getAll(this.jwt).subscribe({
            next: (v) => {
                const allUsers = v as Array<User>
                this.usuarios = allUsers.sort((a) => {
                    if(a._id == this.myId) return -1
                    return 0
                })
                const ROLES = [
                    'ADMIN',     
                    'COCINERO',  
                    'COMENSAL',  
                    ''           
                ]
                this.usuarios.map(u => u.rol = ROLES[parseInt(u.rol)])
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
