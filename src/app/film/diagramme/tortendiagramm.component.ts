/*
 * Copyright (C) 2015 - present Juergen Zimmermann, Hochschule Karlsruhe
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

import { Film, FilmService } from '../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { first, map } from 'rxjs/operators';
import { Component } from '@angular/core';
import type { DataItem } from '@swimlane/ngx-charts';
import type { Observable } from 'rxjs';
import type { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser'; // eslint-disable-line @typescript-eslint/consistent-type-imports

/**
 * Komponente mit dem Tag &lt;hs-tortendiagramm&gt; zur Visualisierung
 * von Bewertungen durch ein Tortendiagramm.
 */
@Component({
    selector: 'hs-tortendiagramm',
    templateUrl: './tortendiagramm.html',
})
export class TortendiagrammComponent implements OnInit {
    dataItems!: DataItem[];

    constructor(
        private readonly filmService: FilmService,
        private readonly titleService: Title,
    ) {
        console.log('TortendiagrammComponent.constructor()');
    }

    /**
     * Daten fuer das Tortendiagramm bereitstellen.
     */
    ngOnInit() {
        console.log('TortendiagrammComponent.ngOnInit()');
        this.setDataItems();
        this.titleService.setTitle('Tortendiagramm');
    }

    private setDataItems() {
        const filme$ = this.filmService.find() as Observable<Film[]>;
        filme$
            .pipe(
                map(filme =>
                    filme
                        .filter(film => film.rating !== undefined)
                        .map(film => this.toDataItem(film)),
                ),
                first(),
            )
            // eslint-disable-next-line rxjs/no-ignored-error, no-extra-parens
            .subscribe(dataItems => (this.dataItems = dataItems));
    }

    // https://stackblitz.com/edit/swimlane-pie-chart?embed=1&file=app/app.component.ts
    private toDataItem(film: Film) {
        const dataItem: DataItem = {
            name: film._id as string,
            value: film.rating as number,
        };
        return dataItem;
    }
}
