/*
 * Copyright (C) 2019 - present Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Direktiven (z.B. ngFor, ngIf) und Pipes
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginLogoutComponent } from './login-logout.component';
import { MaterialModule } from '../../material.module';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [LoginLogoutComponent],
    exports: [LoginLogoutComponent],
    imports: [CommonModule, FormsModule, MaterialModule],
})
export class LoginLogoutModule {}
