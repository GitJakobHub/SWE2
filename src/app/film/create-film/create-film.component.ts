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

import { Film, FilmService, SaveError } from '../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { HOME_PATH, HttpStatus } from '../../shared';
import { first, tap } from 'rxjs/operators';

import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { Title } from '@angular/platform-browser'; // eslint-disable-line @typescript-eslint/consistent-type-imports

/**
 * Komponente mit dem Tag &lt;create-film&gt;, um das Erfassungsformular
 * f&uuml;r einen neuen Film zu realisieren.
 */
@Component({
    selector: 'hs-create-film',
    templateUrl: './create-film.component.html',
})
export class CreateFilmComponent implements OnInit {
    form = new FormGroup({});

    showWarning = false;

    fertig = false;

    errorMsg: string | undefined = undefined;

    constructor(
        private readonly filmService: FilmService,
        private readonly router: Router,
        private readonly titleService: Title,
    ) {
        console.log('CreateFilmComponent.constructor()');
        console.log('Injizierter Router:', router);
    }

    ngOnInit() {
        this.titleService.setTitle('Neuen Film');
    }

    /**
     * Die Methode <code>save</code> realisiert den Event-Handler, wenn das
     * Formular abgeschickt wird, um einen neuen Film anzulegen.
     * @return false, um das durch den Button-Klick ausgel&ouml;ste Ereignis
     *         zu konsumieren.
     */
    onSave() {
        // In einem Control oder in einer FormGroup gibt es u.a. folgende
        // Properties
        //    value     JSON-Objekt mit den IDs aus der FormGroup als
        //              Schluessel und den zugehoerigen Werten
        //    errors    Map<string,any> mit den Fehlern, z.B. {'required': true}
        //    valid/invalid     fuer valide Werte
        //    dirty/pristine    falls der Wert geaendert wurde

        if (this.form.invalid) {
            console.log(
                'CreateFilmComponent.onSave(): Validierungsfehler',
                this.form,
            );
        }

        const neuenFilm = Film.fromForm(this.form.value);
        console.log('CreateFilmComponent.onSave(): neuenFilm=', neuenFilm);

        this.filmService
            .save(neuenFilm)
            .pipe(
                tap(result => this.setProps(result)),
                first(),
            )
            .subscribe({ complete: () => this.complete() });
    }

    private setProps(result: string | SaveError) {
        if (result instanceof SaveError) {
            this.handleError(result);
            return;
        }

        this.fertig = true;
        this.showWarning = false;
        this.errorMsg = undefined;

        const id = result;
        console.log(`CreateFilmComponent.onSave(): id=${id}`);
    }

    private handleError(err: SaveError) {
        const { statuscode } = err;
        console.log(
            `CreateFilmComponent.handleError(): statuscode=${statuscode}, err=`,
            err,
        );

        switch (statuscode) {
            case HttpStatus.BAD_REQUEST:
                // TODO Aufbereitung der Fehlermeldung: u.a. Anfuehrungszeichen
                this.errorMsg =
                    err.cause instanceof HttpErrorResponse
                        ? err.cause.error
                        : JSON.stringify(err.cause);
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

    private async complete() {
        if (this.errorMsg === undefined) {
            await this.router.navigate([HOME_PATH]);
        }
    }
}
