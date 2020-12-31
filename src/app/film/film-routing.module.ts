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

import { AdminGuard } from '../auth/admin.guard';
import { BalkendiagrammComponent } from './diagramme/balkendiagramm.component';
import { CreateFilmComponent } from './create-film/create-film.component';
import { CreateFilmGuard } from './create-film/create-film.guard';
import { DetailsFilmComponent } from './details-film/details-film.component';
import { LiniendiagrammComponent } from './diagramme/liniendiagramm.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { Routes } from '@angular/router';
import { SucheFilmeComponent } from './suche-filme/suche-filme.component';
import { TortendiagrammComponent } from './diagramme/tortendiagramm.component';
import { UpdateFilmComponent } from './update-film/update-film.component';

// Route-Definitionen fuer das Feature-Modul "film":
// Zuordnung von Pfaden und Komponenten mit HTML-Templates
const routes: Routes = [
    {
        path: 'suche',
        component: SucheFilmeComponent,
    },
    {
        path: 'create',
        component: CreateFilmComponent,
        canActivate: [AdminGuard],
        canDeactivate: [CreateFilmGuard],
    },
    {
        path: 'balkendiagramm',
        component: BalkendiagrammComponent,
        canActivate: [AdminGuard],
    },
    {
        path: 'liniendiagramm',
        component: LiniendiagrammComponent,
        canActivate: [AdminGuard],
    },
    {
        path: 'tortendiagramm',
        component: TortendiagrammComponent,
        canActivate: [AdminGuard],
    },

    // id als Pfad-Parameter
    {
        path: ':id',
        component: DetailsFilmComponent,
    },
    {
        path: ':id/update',
        component: UpdateFilmComponent,
        canActivate: [AdminGuard],
    },
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)],
})
export class FilmRoutingModule {}
