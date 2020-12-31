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

import { FilmService, UpdateError } from '../../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HOME_PATH, HttpStatus } from '../../../shared';
import type { Film } from '../../shared';
import { HttpErrorResponse } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { first } from 'rxjs/operators';

/**
 * Komponente f&uuml;r das Tag <code>hs-schlagwoerter</code>
 */
@Component({
    selector: 'hs-update-schlagwoerter',
    templateUrl: './update-schlagwoerter.component.html',
})
export class UpdateSchlagwoerterComponent implements OnInit {
    // <hs-update-schlagwoerter [film]="...">
    @Input()
    film!: Film;

    form!: FormGroup;

    javascript!: FormControl;

    typescript!: FormControl;

    errorMsg: string | undefined = undefined;

    constructor(
        private readonly filmService: FilmService,
        private readonly router: Router,
    ) {
        console.log('UpdateSchlagwoerterComponent.constructor()');
    }

    /**
     * Das Formular als Gruppe von Controls initialisieren und mit den
     * Schlagwoertern des zu &auml;ndernden Films vorbelegen.
     */
    ngOnInit() {
        console.log('film=', this.film);

        // Definition und Vorbelegung der Eingabedaten (hier: Checkbox)
        const hasJavaScript = this.film.hasSchlagwort('JAVASCRIPT');
        this.javascript = new FormControl(hasJavaScript);
        const hasTypeScript = this.film.hasSchlagwort('TYPESCRIPT');
        this.typescript = new FormControl(hasTypeScript);

        this.form = new FormGroup({
            // siehe ngFormControl innerhalb von @Component({template: `...`})
            javascript: this.javascript,
            typescript: this.typescript,
        });
    }

    /**
     * Die aktuellen Schlagwoerter f&uuml;r das angezeigte Film-Objekt
     * zur&uuml;ckschreiben.
     * @return false, um das durch den Button-Klick ausgel&ouml;ste Ereignis
     *         zu konsumieren.
     */
    onUpdate() {
        if (this.form.pristine) {
            console.log(
                'UpdateSchlagwoerterComponent.onUpdate(): keine Aenderungen',
            );
            return;
        }

        this.film.updateSchlagwoerter(
            this.javascript.value,
            this.typescript.value,
        );
        console.log('film=', this.film);

        const next = async (result: Film | UpdateError) => {
            if (result instanceof UpdateError) {
                this.handleError(result);
                return;
            }

            await this.router.navigate([HOME_PATH]);
        };
        this.filmService.update(this.film).pipe(first()).subscribe({ next });

        // damit das (Submit-) Ereignis konsumiert wird und nicht an
        // uebergeordnete Eltern-Komponenten propagiert wird bis zum
        // Refresh der gesamten Seite
        return false;
    }

    private handleError(err: UpdateError) {
        const { statuscode } = err;
        console.log(
            `UpdateSchlagwoerterComponent.handleError(): statuscode=${statuscode}`,
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

        console.log(
            `UpdateSchlagwoerterComponent.handleError(): errorMsg=${this.errorMsg}`,
        );
    }
}
