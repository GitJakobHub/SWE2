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

import { BASE_URI, HttpStatus } from '../shared';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CookieService } from './cookie.service';
import { Injectable } from '@angular/core';

enum Rolle {
    ROLE_ADMIN = 'admin',
    ROLE_KUNDE = 'kunde',
    ROLE_MITARBEITER = 'mitarbeiter',
}

export interface Identity {
    username: string;
    rollen: Rolle[];
    password?: string;
}

@Injectable({ providedIn: 'root' })
export class BasicAuthService {
    constructor(private readonly cookieService: CookieService) {
        console.log('BasicAuthService.constructor()');
    }

    /**
     * @param username als String
     * @param password als String
     * @return void
     */
    async login(
        username: string | undefined,
        password: string | undefined,
    ): Promise<string[]> {
        console.log(
            `BasicAuthService.login(): username=${username}, password=${password}`,
        );
        const loginUri = `${BASE_URI}/auth/rollen`;
        console.log(`BasicAuthService.login(): loginUri=${loginUri}`);

        const base64 = window.btoa(`${username}:${password}`);
        const basicAuth = `Basic ${base64}`;

        // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        const headers = new Headers();
        headers.append('Authorization', basicAuth);
        const request = new Request(loginUri, {
            method: 'GET',
            headers,
        });

        let response: Response | undefined;
        try {
            response = await fetch(request);
            // Optional catch binding parameters
        } catch {
            console.error(
                'BasicAuthService.login(): Kommunikationsfehler mit d. Appserver',
            );
        }
        if (response === undefined) {
            return Promise.reject(
                new Error('Kommunikationsfehler mit dem Appserver'),
            );
        }

        const { status } = response;
        console.log(`BasicAuthService.login(): status=${status}`);
        if (status !== HttpStatus.OK) {
            return Promise.reject(new Error(response.statusText));
        }

        const json = await response.json();
        console.log('BasicAuthService.login(): json', json);
        // Array von Strings als 1 String
        const roles: string = json.join();
        console.log(`BasicAuthService.login(): roles=${roles}`);

        this.cookieService.saveAuthorization(
            // Base64-String fuer 1 Tag speichern
            basicAuth,
            roles,
        );
        return json[0];
    }
}
