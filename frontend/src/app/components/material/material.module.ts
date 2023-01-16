import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import {MatInputModule} from '@angular/material/input'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {MatSnackBarModule} from '@angular/material/snack-bar'
import {MatCheckboxModule} from '@angular/material/checkbox'
import {MatDatepickerModule} from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import {MatIconModule} from '@angular/material/icon';

const materials = [
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  BrowserAnimationsModule,
  MatSnackBarModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatIconModule,
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    materials
  ],
  exports: [
    materials
  ]
})
export class MaterialModule { }
