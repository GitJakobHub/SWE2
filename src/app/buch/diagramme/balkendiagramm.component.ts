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

import { Buch, BuchService } from '../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { first, map } from 'rxjs/operators';
import { Component } from '@angular/core';
import type { DataItem } from '@swimlane/ngx-charts';
import type { Observable } from 'rxjs';
import type { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser'; // eslint-disable-line @typescript-eslint/consistent-type-imports

// D3 (= Data Driven Documents) https://d3js.org ist das fuehrende Produkt
// fuer Datenvisualisierung:
//  initiale Version durch die Dissertation von Mike Bostock
//  gesponsort von der New York Times, seinem heutigen Arbeitgeber
//  basiert auf SVG = scalable vector graphics: Punkte, Linien, Kurven, ...
//  ca 250.000 Downloads/Monat bei https://www.npmjs.com
//  https://github.com/mbostock/d3 mit ueber 100 Contributors

// Alternativen:
// ngx-charts:    https://swimlane.gitbook.io/ngx-charts
// Google Charts: https://google-developers.appspot.com/chart
// Chart.js:      https://github.com/nnnick/Chart.js
// Chartist.js:   http://gionkunz.github.io/chartist-js
// n3-chart:      http://n3-charts.github.io/line-chart

// https://www.ngdevelop.tech/best-angular-chart-libraries
// https://openbase.io/packages/top-angular-chart-libraries

/**
 * Komponente mit dem Tag &lt;hs-balkendiagramm&gt; zur Visualisierung
 * von Bewertungen durch ein Balkendiagramm.
 * https://blog.angular-university.io/angular-viewchild
 */
@Component({
    selector: 'hs-balkendiagramm',
    templateUrl: './balkendiagramm.html',
})
export class BalkendiagrammComponent implements OnInit {
    dataItems!: DataItem[];

    constructor(
        private readonly buchService: BuchService,
        private readonly titleService: Title,
    ) {
        console.log('BalkendiagrammComponent.constructor()');
    }

    /**
     * Daten fuer das Balkendiagramm bereitstellen.
     */
    ngOnInit() {
        console.log('BalkendiagrammComponent.ngOnInit()');
        this.setDataItems();
        this.titleService.setTitle('Balkendiagramm');
    }

    private setDataItems() {
        const buecher$ = this.buchService.find() as Observable<Buch[]>;
        buecher$
            .pipe(
                map(buecher =>
                    buecher
                        .filter(buch => buch.rating !== undefined)
                        .map(buch => this.toDataItem(buch)),
                ),
                first(),
            )
            // eslint-disable-next-line rxjs/no-ignored-error, no-extra-parens
            .subscribe(dataItems => (this.dataItems = dataItems));
    }

    // https://swimlane.gitbook.io/ngx-charts/examples/bar-charts/vertical-bar-chart
    // https://blog.knoldus.com/visualizing-data-with-ngx-charts-in-angular
    private toDataItem(buch: Buch) {
        const dataItem: DataItem = {
            name: buch._id as string,
            value: buch.rating as number,
        };
        return dataItem;
    }
}
