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

import { CookieService } from './cookie.service'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { Injectable } from '@angular/core';
import { JwtService } from './jwt.service'; // eslint-disable-line @typescript-eslint/consistent-type-imports
import { Subject } from 'rxjs';

export const ROLLE_ADMIN = 'admin';
// Spring Security:
// export const ROLLE_ADMIN = 'ROLE_ADMIN'

@Injectable({ providedIn: 'root' })
export class AuthService {
    // in RxJS: Observables = Event-Streaming mit Promises
    // Subject statt Basisklasse Observable: in login() und logout() wird next() aufgerufen
    // Suffix "$" wird als "Finnish Notation" bezeichnet https://medium.com/@benlesh/observables-and-finnish-notation-df8356ed1c9b
    readonly isLoggedInSubject$ = new Subject<boolean>();

    readonly rollenSubject$ = new Subject<string[]>();

    constructor(
        private readonly jwtService: JwtService,
        private readonly cookieService: CookieService,
    ) {
        if (this.isLoggedIn) {
            console.log('AuthService.constructor(): bereits eingeloggt');
            this.isLoggedInSubject$.next(true);
        } else {
            console.log('AuthService.constructor(): noch nicht eingeloggt');
            this.isLoggedInSubject$.next(false);
        }
    }

    /**
     * @param username als String
     * @param password als String
     * @return void
     */
    async login(username: string | undefined, password: string | undefined) {
        console.log(
            `AuthService.login(): username=${username}, password=${password}`,
        );
        let rollen: string[] = [];
        try {
            // this.basicAuthService.login(username, password)
            rollen = await this.jwtService.login(username, password);
            console.log('AuthService.login()', rollen);
            this.isLoggedInSubject$.next(true);
        } catch (err: unknown) {
            console.warn('AuthService.login():', err);
            this.isLoggedInSubject$.next(false);
        }

        this.rollenSubject$.next(rollen);
    }

    /**
     * @return void
     */
    logout() {
        console.log('AuthService.logout()');
        this.cookieService.deleteAuthorization();
        this.isLoggedInSubject$.next(false);
        this.rollenSubject$.next([]);
    }

    /**
     * @return String fuer JWT oder Basic-Authentifizierung
     */
    get authorization() {
        return this.cookieService.getAuthorization();
    }

    /**
     * @return true, falls ein User eingeloggt ist; sonst false.
     */
    get isLoggedIn() {
        return this.cookieService.getAuthorization() !== undefined;
    }

    /**
     * @return true, falls ein User in der Rolle "admin" eingeloggt ist;
     *         sonst false.
     */
    get isAdmin() {
        // z.B. 'admin,mitarbeiter'
        const rolesStr = this.cookieService.getRoles();
        if (rolesStr === undefined) {
            return false;
        }

        // z.B. ['admin', 'mitarbeiter']
        const rolesArray = rolesStr.split(',');
        return rolesArray.includes(ROLLE_ADMIN);
    }
}
