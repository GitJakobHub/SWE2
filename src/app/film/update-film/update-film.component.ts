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

import { FilmService, FindError } from '../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { first, tap } from 'rxjs/operators';

import { ActivatedRoute } from '@angular/router'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { Component } from '@angular/core';
import type { Film } from '../shared';
import { HttpStatus } from '../../shared';
import type { OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser'; // eslint-disable-line @typescript-eslint/consistent-type-imports

/**
 * Komponente f&uuml;r das Tag <code>hs-update-film</code> mit Kindkomponenten
 * f&uuml;r die folgenden Tags:
 * <ul>
 *  <li> <code>hs-stammdaten</code>
 *  <li> <code>hs-schlagwoerter</code>
 * </ul>
 */
@Component({
    selector: 'hs-update-film',
    templateUrl: './update-film.component.html',
})
export class UpdateFilmComponent implements OnInit {
    film: Film | undefined;

    errorMsg: string | undefined;

    constructor(
        private readonly filmService: FilmService,
        private readonly titleService: Title,
        private readonly route: ActivatedRoute,
    ) {
        console.log('UpdateFilmComponent.constructor()');
    }

    ngOnInit() {
        // Pfad-Parameter aus /filme/:id/update
        const id = this.route.snapshot.paramMap.get('id') ?? undefined;

        this.filmService
            .findById(id)
            .pipe(
                tap(result => this.setProps(result)),
                first(),
            )
            .subscribe();
    }

    private setProps(result: Film | FindError) {
        if (result instanceof FindError) {
            this.handleError(result);
            return;
        }

        this.film = result;
        this.errorMsg = undefined;

        const titel = `Aktualisieren ${this.film._id}`;
        this.titleService.setTitle(titel);
    }

    private handleError(err: FindError) {
        const { statuscode } = err;
        console.log(
            `UpdateFilmComponent.handleError(): statuscode=${statuscode}`,
        );

        this.film = undefined;

        switch (statuscode) {
            case HttpStatus.NOT_FOUND:
                this.errorMsg = 'Kein Film gefunden.';
                break;
            case HttpStatus.TOO_MANY_REQUESTS:
                this.errorMsg =
                    'Zu viele Anfragen. Bitte versuchen Sie es später noch einmal.';
                break;
            case HttpStatus.GATEWAY_TIMEOUT:
                this.errorMsg = 'Ein interner Fehler ist aufgetreten.';
                console.error('Laeuft der Appserver?');
                break;
            default:
                this.errorMsg = 'Ein unbekannter Fehler ist aufgetreten.';
                break;
        }
    }
}
