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

import { BuchService, UpdateError } from '../../shared'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HOME_PATH, HttpStatus } from '../../../shared';
import type { Buch } from '../../shared';
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
    // <hs-update-schlagwoerter [buch]="...">
    @Input()
    buch!: Buch;

    form!: FormGroup;

    javascript!: FormControl;

    typescript!: FormControl;

    errorMsg: string | undefined = undefined;

    constructor(
        private readonly buchService: BuchService,
        private readonly router: Router,
    ) {
        console.log('UpdateSchlagwoerterComponent.constructor()');
    }

    /**
     * Das Formular als Gruppe von Controls initialisieren und mit den
     * Schlagwoertern des zu &auml;ndernden Buchs vorbelegen.
     */
    ngOnInit() {
        console.log('buch=', this.buch);

        // Definition und Vorbelegung der Eingabedaten (hier: Checkbox)
        const hasJavaScript = this.buch.hasSchlagwort('JAVASCRIPT');
        this.javascript = new FormControl(hasJavaScript);
        const hasTypeScript = this.buch.hasSchlagwort('TYPESCRIPT');
        this.typescript = new FormControl(hasTypeScript);

        this.form = new FormGroup({
            // siehe ngFormControl innerhalb von @Component({template: `...`})
            javascript: this.javascript,
            typescript: this.typescript,
        });
    }

    /**
     * Die aktuellen Schlagwoerter f&uuml;r das angezeigte Buch-Objekt
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

        this.buch.updateSchlagwoerter(
            this.javascript.value,
            this.typescript.value,
        );
        console.log('buch=', this.buch);

        const next = async (result: Buch | UpdateError) => {
            if (result instanceof UpdateError) {
                this.handleError(result);
                return;
            }

            await this.router.navigate([HOME_PATH]);
        };
        this.buchService.update(this.buch).pipe(first()).subscribe({ next });

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
