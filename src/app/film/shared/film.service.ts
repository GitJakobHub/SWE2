/* eslint-disable max-lines,no-null/no-null */

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

import { BASE_URI, BUECHER_PATH_REST } from '../../shared';
import type { BuchArt, BuchServer, Verlag } from './film';
import { FindError, RemoveError, SaveError, UpdateError } from './errors';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
    HttpClient,
    HttpHeaders,
    HttpParams,
    HttpResponse,
} from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Buch } from './film';
import type { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

export interface Suchkriterien {
    titel: string;
    verlag: Verlag | '';
    art: BuchArt | '';
    schlagwoerter: { javascript: boolean; typescript: boolean };
}

// Methoden der Klasse HttpClient
//  * get(url, options) – HTTP GET request
//  * post(url, body, options) – HTTP POST request
//  * put(url, body, options) – HTTP PUT request
//  * patch(url, body, options) – HTTP PATCH request
//  * delete(url, options) – HTTP DELETE request

// Eine Service-Klasse ist eine "normale" Klasse gemaess ES 2015, die mittels
// DI in eine Komponente injiziert werden kann, falls sie innerhalb von
// provider: [...] bei einem Modul oder einer Komponente bereitgestellt wird.
// Eine Komponente realisiert gemaess MVC-Pattern den Controller und die View.
// Die Anwendungslogik wird vom Controller an Service-Klassen delegiert.

/**
 * Die Service-Klasse zu B&uuml;cher wird zum "Root Application Injector"
 * hinzugefuegt und ist in allen Klassen der Webanwendung verfuegbar.
 */
/* eslint-disable no-underscore-dangle */
@Injectable({ providedIn: 'root' })
export class BuchService {
    private readonly baseUriBuecher!: string;

    private _buch: Buch | undefined;

    /**
     * @param httpClient injizierter Service HttpClient (von Angular)
     * @return void
     */
    constructor(private readonly httpClient: HttpClient) {
        this.baseUriBuecher = `${BASE_URI}/${BUECHER_PATH_REST}`;
        console.log(
            `BuchService.constructor(): baseUriBuch=${this.baseUriBuecher}`,
        );
    }

    /**
     * Ein Buch-Objekt puffern.
     * @param buch Das Buch-Objekt, das gepuffert wird.
     * @return void
     */
    set buch(buch: Buch) {
        console.log('BuchService.set buch()', buch);
        this._buch = buch;
    }

    /**
     * Buecher anhand von Suchkriterien suchen
     * @param suchkriterien Die Suchkriterien
     * @returns Gefundene Buecher oder Statuscode des fehlerhaften GET-Requests
     */
    find(
        suchkriterien: Suchkriterien | undefined = undefined, // eslint-disable-line unicorn/no-useless-undefined
    ): Observable<Buch[] | FindError> {
        console.log('BuchService.find(): suchkriterien=', suchkriterien);
        const params = this.suchkriterienToHttpParams(suchkriterien);
        const uri = this.baseUriBuecher;
        console.log(`BuchService.find(): uri=${uri}`);

        return (
            this.httpClient
                /* eslint-disable object-curly-newline */
                .get<BuchServer[]>(uri, {
                    params,
                })
                /* eslint-enable object-curly-newline */

                .pipe(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    catchError((err: unknown, _$) => {
                        const errResponse = err as HttpErrorResponse;
                        return of(this.buildFindError(errResponse));
                    }),

                    // entweder Observable<BuchServer[]> oder Observable<FindError>
                    map(result => this.findResultToBuchArray(result)),
                )
        );

        // Same-Origin-Policy verhindert Ajax-Datenabfragen an einen Server in
        // einer anderen Domain. JSONP (= JSON mit Padding) ermoeglicht die
        // Uebertragung von JSON-Daten ueber Domaingrenzen.
        // Falls benoetigt, gibt es in Angular dafuer den Service Jsonp.
    }

    private findResultToBuchArray(
        result: BuchServer[] | FindError,
    ): Buch[] | FindError {
        if (result instanceof FindError) {
            return result;
        }

        const buecher = result.map(buch => Buch.fromServer(buch));
        console.log('BuchService.mapFindResult(): buecher=', buecher);
        return buecher;
    }

    /**
     * Ein Buch anhand der ID suchen
     * @param id Die ID des gesuchten Buchs
     */
    findById(id: string | undefined): Observable<Buch | FindError> {
        console.log(`BuchService.findById(): id=${id}`);

        if (id === undefined) {
            console.log('BuchService.findById(): Keine Id');
            return of(this.buildFindError());
        }

        // Gibt es ein gepuffertes Buch mit der gesuchten ID und Versionsnr.?
        if (
            this._buch !== undefined &&
            this._buch._id === id &&
            this._buch.version !== undefined
        ) {
            console.log(
                `BuchService.findById(): Buch gepuffert, version=${this._buch.version}`,
            );
            return of(this._buch);
        }

        // wegen fehlender Versionsnummer (im ETag) nachladen
        const uri = `${this.baseUriBuecher}/${id}`;
        console.log(`BuchService.findById(): uri=${uri}`);

        return (
            this.httpClient
                /* eslint-disable object-curly-newline */
                .get<BuchServer>(uri, {
                    observe: 'response',
                })
                /* eslint-enable object-curly-newline */

                .pipe(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    catchError((err: unknown, _$) => {
                        const errResponse = err as HttpErrorResponse;
                        return of(this.buildFindError(errResponse));
                    }),

                    // entweder Observable<HttpResponse<BuchServer>> oder Observable<FindError>
                    map(result => this.findByIdResultToBuch(result)),
                )
        );
    }

    private findByIdResultToBuch(
        result: HttpResponse<BuchServer> | FindError,
    ): Buch | FindError {
        if (result instanceof FindError) {
            return result;
        }

        const { body, headers } = result;
        if (body === null) {
            return this.buildFindError();
        }

        const etag = headers.get('ETag') ?? undefined;
        console.log(`etag = ${etag}`);

        this._buch = Buch.fromServer(body, etag);
        return this._buch;
    }

    /**
     * Ein neues Buch anlegen
     * @param neuesBuch Das JSON-Objekt mit dem neuen Buch
     */
    save(buch: Buch): Observable<string | SaveError> {
        console.log('BuchService.save(): buch=', buch);
        buch.datum = new Date();

        /* eslint-disable @typescript-eslint/naming-convention */
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'text/plain',
        });
        /* eslint-enable @typescript-eslint/naming-convention */

        return this.httpClient
            .post(this.baseUriBuecher, buch.toJSON(), {
                headers,
                observe: 'response',
                responseType: 'text',
            })
            .pipe(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                catchError((err: unknown, _$) => {
                    const errResponse = err as HttpErrorResponse;
                    return of(new SaveError(errResponse.status, errResponse));
                }),

                // entweder Observable<HttpResponse<string>> oder Observable<SaveError>
                map(result => this.mapSaveResultToId(result)),
            );
    }

    private mapSaveResultToId(
        result: HttpResponse<string> | SaveError,
    ): string | SaveError {
        if (!(result instanceof HttpResponse)) {
            return result;
        }

        const response = result;
        console.log('BuchService.save(): map(): response', response);

        // id aus Header "Locaction" extrahieren
        const location = response.headers.get('Location');
        const id = location?.slice(location.lastIndexOf('/') + 1);

        if (id === undefined) {
            return new SaveError(-1, 'Keine Id');
        }

        return id;
    }

    /**
     * Ein vorhandenes Buch aktualisieren
     * @param buch Das JSON-Objekt mit den aktualisierten Buchdaten
     */
    update(buch: Buch): Observable<Buch | UpdateError> {
        console.log('BuchService.update(): buch=', buch);

        const { version } = buch;
        if (version === undefined) {
            const msg = `Keine Versionsnummer fuer das Buch ${buch._id}`;
            console.error(msg);
            return of(new UpdateError(-1, msg));
        }

        const uri = `${this.baseUriBuecher}/${buch._id}`;
        /* eslint-disable @typescript-eslint/naming-convention */
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'text/plain',
            'If-Match': `"${version}"`,
        });
        /* eslint-enable @typescript-eslint/naming-convention */
        console.log('BuchService.update(): headers=', headers);

        return this.httpClient
            .put(uri, buch, { headers, observe: 'response' })
            .pipe(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                catchError((err: unknown, _$) => {
                    const errResponse = err as HttpErrorResponse;
                    return of(new UpdateError(errResponse.status, errResponse));
                }),

                map(result => this.mapUpdateResultToVersion(result)),

                map(versionOderError => {
                    if (versionOderError instanceof UpdateError) {
                        return versionOderError;
                    }
                    buch.version = versionOderError;
                    return buch;
                }),
            );
    }

    private mapUpdateResultToVersion(
        result: HttpResponse<unknown> | UpdateError,
    ): number | UpdateError {
        if (result instanceof UpdateError) {
            return result;
        }

        const response = result;
        console.log('BuchService.mapUpdateResult(): response', response);
        const etag = response.headers.get('ETag');
        console.log(`BuchService.mapUpdateResult(): etag=${etag}`);

        const ende = etag?.lastIndexOf('"');
        const versionStr = etag?.slice(1, ende) ?? '1';
        return Number.parseInt(versionStr, 10);
    }

    /**
     * Ein Buch l&ouml;schen
     * @param buch Das JSON-Objekt mit dem zu loeschenden Buch
     */
    remove(buch: Buch): Observable<Record<string, unknown> | RemoveError> {
        console.log('BuchService.remove(): buch=', buch);
        const uri = `${this.baseUriBuecher}/${buch._id}`;

        return this.httpClient.delete(uri).pipe(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            catchError((err: unknown, _$) => {
                const errResponse = err as HttpErrorResponse;
                return of(new RemoveError(errResponse.status));
            }),

            map(result => {
                if (result instanceof RemoveError) {
                    return result;
                }
                return {};
            }),
        );
    }

    /**
     * Suchkriterien in Request-Parameter konvertieren.
     * @param suchkriterien Suchkriterien fuer den GET-Request.
     * @return Parameter fuer den GET-Request
     */
    private suchkriterienToHttpParams(
        suchkriterien: Suchkriterien | undefined,
    ): HttpParams {
        console.log(
            'BuchService.suchkriterienToHttpParams(): suchkriterien=',
            suchkriterien,
        );
        let httpParams = new HttpParams();

        if (suchkriterien === undefined) {
            return httpParams;
        }

        const { titel, verlag, art, schlagwoerter } = suchkriterien;
        const { javascript, typescript } = schlagwoerter;

        if (titel !== '') {
            httpParams = httpParams.set('titel', titel);
        }
        if (art !== '') {
            httpParams = httpParams.set('art', art);
        }
        if (verlag !== '') {
            httpParams = httpParams.set('verlag', verlag);
        }
        if (javascript) {
            httpParams = httpParams.set('javascript', 'true');
        }
        if (typescript) {
            httpParams = httpParams.set('typescript', 'true');
        }
        return httpParams;
    }

    private buildFindError(err?: HttpErrorResponse) {
        if (err === undefined) {
            return new FindError(-1);
        }

        if (err.error instanceof ProgressEvent) {
            const msg = 'Client-seitiger oder Netzwerkfehler';
            console.error(msg, err.error);
            return new FindError(-1, err);
        }

        const { status, error } = err;
        console.log(
            `BuchService.buildFindError(): status=${status}, Response-Body=`,
            error,
        );
        return new FindError(status, err);
    }
}
/* eslint-enable no-underscore-dangle */
/* eslint-enable max-lines,no-null/no-null */
