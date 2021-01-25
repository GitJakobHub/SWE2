/*
 * Copyright (C) 2016 - present Juergen Zimmermann, Hochschule Karlsruhe
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

import { CommonModule } from '@angular/common';
import { ErrorMessageModule } from '../../shared/error-message.module';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UpdateFilmComponent } from './update-film.component';
import { UpdateSchlagwoerterModule } from './schlagwoerter/update-schlagwoerter.module';
import { UpdateStammdatenModule } from './stammdaten/update-stammdaten.module';

@NgModule({
    declarations: [UpdateFilmComponent],
    exports: [UpdateFilmComponent],
    imports: [
        CommonModule,
        FormsModule,
        ErrorMessageModule,
        UpdateSchlagwoerterModule,
        UpdateStammdatenModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
    ],
    providers: [Title],
})
export class UpdateFilmModule {}
