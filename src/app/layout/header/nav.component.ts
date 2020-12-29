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

import { AuthService, ROLLE_ADMIN } from '../../auth/auth.service'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { share, tap } from 'rxjs/operators';
import { Component } from '@angular/core';
import type { OnInit } from '@angular/core';

/**
 * Komponente f&uuml;r die Navigationsleiste mit dem Tag &lt;hs-nav&gt;.
 */
@Component({
    selector: 'hs-nav',
    templateUrl: './nav.component.html',
})
export class NavComponent implements OnInit {
    isAdmin!: boolean;

    constructor(private readonly authService: AuthService) {
        console.log('NavComponent.constructor()');
    }

    ngOnInit() {
        this.isAdmin = this.authService.isAdmin;

        // beobachten, ob es Informationen zur Rolle "admin" gibt
        // Observable.subscribe() aus RxJS liefert ein Subscription Objekt,
        // mit dem man den Request auch abbrechen ("cancel") kann
        // https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/subscribe.md
        // http://stackoverflow.com/questions/34533197/what-is-the-difference-between-rx-observable-subscribe-and-foreach
        // https://xgrommx.github.io/rx-book/content/observable/observable_instance_methods/subscribe.html
        // Funktion als Funktionsargument, d.h. Code als Daten uebergeben

        this.authService.rollenSubject$
            .pipe(
                tap(rollen => {
                    this.isAdmin = rollen.includes(ROLLE_ADMIN);
                }),
                share(),
            )
            .subscribe();
    }
}
