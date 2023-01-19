import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'src/app/services/auth/auth.service';
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
    @Output() actions: EventEmitter<object> = new EventEmitter<object>()

    usuarios!: Array<User>
    dataSource!: MatTableDataSource<User>
    columsDefinitions!: Array<todo>

    getDisplayedColumns(): string[] {
        return this.columsDefinitions.filter(cd => cd.hide).map(cd => cd.def)
    }

    constructor (
        userService: UserService,
        authService: AuthService,
    ) { 
        userService.getAll(authService.token).subscribe({
            next: (v) => {
                this.usuarios = v as Array<User>
            },
            error: (e) => {
                console.error(e);
            }
        })
    }

    ngOnInit(): void {
        this.columsDefinitions = [
            { def: 'name', label: 'name', hide: true },
            { def: 'email', label: 'email', hide: true },
            { def: 'surname', label: 'surname', hide: true },
            { def: 'roles', label: 'roles', hide: true },
            { def: 'actions', label: 'actions', hide: this.hasActions},
        ]
    }

    sendInfo(user: any, option: string) {
        this.actions.emit({
            user, 
            option
        })
    }
}
