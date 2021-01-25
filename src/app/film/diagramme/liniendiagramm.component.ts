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

import type { DataItem, MultiSeries } from '@swimlane/ngx-charts';
import { Film, FilmService } from '../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { first, map } from 'rxjs/operators';

import { Component } from '@angular/core';
import type { Observable } from 'rxjs';
import type { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser'; // eslint-disable-line @typescript-eslint/consistent-type-imports

/**
 * Komponente mit dem Tag &lt;hs-liniendiagramm&gt; zur Visualisierung
 * von Bewertungen durch ein Liniendiagramm.
 */
@Component({
    selector: 'hs-liniendiagramm',
    templateUrl: './liniendiagramm.html',
})
export class LiniendiagrammComponent implements OnInit {
    series!: MultiSeries;

    constructor(
        private readonly filmService: FilmService,
        private readonly titleService: Title,
    ) {
        console.log('LiniendiagrammComponent.constructor()');
    }

    /**
     * Daten fuer das Liniendiagramm bereitstellen.
     */
    ngOnInit() {
        console.log('LiniendiagrammComponent.ngOnInit()');
        this.setSeries();
        this.titleService.setTitle('Liniendiagramm');
    }

    private setSeries() {
        const filme$ = this.filmService.find() as Observable<Film[]>;
        filme$
            .pipe(
                map(filme => filme.filter(film => film.rating !== undefined)),
                first(),
            )
            // eslint-disable-next-line rxjs/no-ignored-error
            .subscribe(filmItems => {
                const bewertungItems = this.getBewertungItems(filmItems);
                const umsatzItems = this.getUmsatzItems(filmItems);
                this.initSeries(bewertungItems, umsatzItems);
            });
    }

    // https://swimlane.gitbook.io/ngx-charts/examples/line-area-charts/line-chart
    private getBewertungItems(filme: Film[]) {
        return filme.map(film => {
            const bewertungItem: DataItem = {
                name: film._id as string,
                value: film.rating as number,
            };
            return bewertungItem;
        });
    }

    private getUmsatzItems(filme: Film[]) {
        return filme.map(film => {
            const umsatzItem: DataItem = {
                name: film._id as string,
                value: film.umsatz,
            };
            return umsatzItem;
        });
    }

    private initSeries(bewertungItems: DataItem[], umsatzItems: DataItem[]) {
        const series: MultiSeries = [
            {
                name: 'Bewertungen',
                series: bewertungItems,
            },
            {
                name: 'Umsatze',
                series: umsatzItems,
            },
        ];

        this.series = series;
    }
}
