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

/* eslint-disable max-classes-per-file */

// Bereitgestellt durch das RouterModule
import { ActivatedRoute, Router } from '@angular/router';
import { Component, Input } from '@angular/core';
import { Film, FilmService, FindError, RemoveError } from '../../shared';
import { HttpStatus, easeIn, easeOut } from '../../../shared';
import type { OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { first, tap } from 'rxjs/operators';

import { AuthService } from '../../../auth/auth.service';
import { NgLocalization } from '@angular/common';
import type { Suchkriterien } from '../../shared';

/**
 * Komponente f&uuml;r das Tag <code>hs-suchergebnis</code>, um zun&auml;chst
 * das Warten und danach das Ergebnis der Suche anzuzeigen, d.h. die gefundenen
 * Filme oder eine Fehlermeldung.
 */
@Component({
    selector: 'hs-suchergebnis',
    templateUrl: './suchergebnis.component.html',
    animations: [easeIn, easeOut],
})
export class SuchergebnisComponent implements OnChanges, OnInit {
    // Im ganzen Beispiel: lokale Speicherung des Zustands und nicht durch z.B.
    // eine Flux-Bibliothek, wie z.B. Redux http://redux.js.org

    // Property Binding: <hs-suchergebnis [waiting]="...">
    // Decorator fuer ein Attribut. Siehe InputMetadata
    @Input()
    suchkriterien: Suchkriterien | undefined;

    waiting = false;

    filme: Film[] = [];
    errorMsg: string | undefined;
    isAdmin!: boolean;

    // Empfehlung: Konstruktor nur fuer DI
    // eslint-disable-next-line max-params
    constructor(
        private readonly filmService: FilmService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly authService: AuthService,
    ) {
        console.log('SuchergebnisComponent.constructor()');
    }

    // Attribute mit @Input() sind undefined im Konstruktor.
    // Methode zum "LifeCycle Hook" OnInit: wird direkt nach dem Konstruktor
    // aufgerufen.
    // Weitere Methoden zum Lifecycle: ngAfterViewInit(), ngAfterContentInit()
    // https://angular.io/docs/ts/latest/guide/cheatsheet.html
    // Die Ableitung vom Interface OnInit ist nicht notwendig, aber erleichtert
    // IntelliSense bei der Verwendung von TypeScript.
    ngOnInit() {
        this.isAdmin = this.authService.isAdmin;
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log('SuchergebnisComponent.ngOnChanges()');
        if (changes.suchkriterien.currentValue === undefined) {
            return;
        }

        this.waiting = true;

        console.log(
            'SuchergebnisComponent.ngOnChanges(): suchkriterien=',
            this.suchkriterien,
        );
        this.filmService
            .find(this.suchkriterien)
            .pipe(
                tap(result => this.setProps(result)),
                first(),
            )
            .subscribe();
    }

    private setProps(result: Film[] | FindError) {
        this.waiting = false;

        if (result instanceof FindError) {
            this.handleFindError(result);
            return;
        }

        this.filme = result;
        console.log('SuchergebnisComponent.setProps(): filme=', this.filme);
        this.errorMsg = undefined;
    }

    private handleFindError(err: FindError) {
        const { statuscode } = err;
        console.log(
            `SuchErgebnisComponent.handleFindError(): statuscode=${statuscode}`,
        );
        this.reset();

        switch (statuscode) {
            case HttpStatus.NOT_FOUND:
                this.errorMsg = 'Keine Filme gefunden.';
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
            `SuchErgebnisComponent.handleFindError(): errorMsg=${this.errorMsg}`,
        );
    }

    private reset() {
        this.suchkriterien = {
            titel: '',
            filmstudio: '',
            art: '',
            schlagwoerter: { javascript: false, typescript: false },
        };

        this.filme = [];
        this.waiting = false;
    }

    /**
     * Das ausgew&auml;hlte bzw. angeklickte Film in der Detailsseite anzeigen.
     * @param film Das ausgew&auml;hlte Film
     */
    onClick(film: Film) {
        console.log('SuchergebnisComponent.onClick(): film=', film);
        // Puffern im Singleton, um nicht erneut zu suchen
        this.filmService.film = film;
        // TODO: NavigationExtras beim Routing
        // https://github.com/angular/angular/pull/27198
        // https://github.com/angular/angular/commit/67f4a5d4bd3e8e6a35d85500d630d94db061900b
        /* eslint-disable object-curly-newline */
        return this.router.navigate(['..', film._id], {
            relativeTo: this.route,
        });
    }

    /**
     * Das ausgew&auml;hlte bzw. angeklickte Film l&ouml;schen.
     * @param film Das ausgew&auml;hlte Film
     */
    onRemove(film: Film) {
        console.log('SuchergebnisComponent.onRemove(): film=', film);

        return this.filmService
            .remove(film)
            .pipe(
                tap(result => {
                    if (result instanceof RemoveError) {
                        console.error(
                            `SuchergebnisComponent.onRemove(): statuscode=${result.statuscode}`,
                        );
                        return;
                    }

                    this.filme = this.filme.filter(b => b._id !== film._id);
                }),
                first(),
            )
            .subscribe();
    }
}

export class AnzahlLocalization extends NgLocalization {
    getPluralCategory(count: number) {
        return count === 1 ? 'single' : 'multi'; // eslint-disable-line no-magic-numbers
    }
}
