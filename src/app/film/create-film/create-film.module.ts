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
import { CreateArtModule } from './create-art.module';
import { CreateDatumModule } from './create-datum.module';
import { CreateFilmComponent } from './create-film.component';
import { CreateFilmstudioModule } from './create-filmstudio.module';
import { CreateIsbnModule } from './create-isbn.module';
import { CreateLieferbarModule } from './create-lieferbar.module';
import { CreateRabattModule } from './create-rabatt.module';
import { CreateRatingModule } from './create-rating.module';
import { CreateSchlagwoerterModule } from './create-schlagwoerter.module';
import { CreateTitelModule } from './create-titel.module';
import { CreateUmsatzModule } from './create-umsatz.module';
import { ErrorMessageModule } from '../../shared/error-message.module';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

// Ein Modul enthaelt logisch zusammengehoerige Funktionalitaet.
// Exportierte Komponenten koennen bei einem importierenden Modul in dessen
// Komponenten innerhalb deren Templates (= HTML-Fragmente) genutzt werden.
// FilmModule ist ein "FeatureModule", das Features fuer Filme bereitstellt
@NgModule({
    declarations: [CreateFilmComponent],
    exports: [CreateFilmComponent],
    imports: [
        CommonModule,
        HttpClientModule,
        ReactiveFormsModule,
        CreateArtModule,
        CreateDatumModule,
        CreateIsbnModule,
        CreateLieferbarModule,
        CreateUmsatzModule,
        CreateRabattModule,
        CreateRatingModule,
        CreateSchlagwoerterModule,
        CreateTitelModule,
        CreateFilmstudioModule,
        ErrorMessageModule,
        MatButtonModule,
        MatIconModule,
    ],
    providers: [Title],
})
export class CreateFilmModule {}
