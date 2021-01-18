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

import { BASE_URI, FILME_PATH_REST } from '../../shared';
import type { FilmArt, FilmServer, Regisseur } from './film';
import { FindError, RemoveError, SaveError, UpdateError } from './errors';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
    HttpClient,
    HttpHeaders,
    HttpParams,
    HttpResponse,
} from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import { Film } from './film';
import type { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

export interface Suchkriterien {
    titel: string;
    regisseur: Regisseur | '';
    art: FilmArt | '';
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
export class FilmService {
    private readonly baseUriFilme!: string;

    private _film: Film | undefined;

    /**
     * @param httpClient injizierter Service HttpClient (von Angular)
     * @return void
     */
    constructor(private readonly httpClient: HttpClient) {
        this.baseUriFilme = `${BASE_URI}/${FILME_PATH_REST}`;
        console.log(
            `FilmService.constructor(): baseUriFilm=${this.baseUriFilme}`,
        );
    }

    /**
     * Ein Film-Objekt puffern.
     * @param film Das Film-Objekt, das gepuffert wird.
     * @return void
     */
    set film(film: Film) {
        console.log('FilmService.set film()', film);
        this._film = film;
    }

    /**
     * Filme anhand von Suchkriterien suchen
     * @param suchkriterien Die Suchkriterien
     * @returns Gefundene Filme oder Statuscode des fehlerhaften GET-Requests
     */
    find(
        suchkriterien: Suchkriterien | undefined = undefined, // eslint-disable-line unicorn/no-useless-undefined
    ): Observable<Film[] | FindError> {
        console.log('FilmService.find(): suchkriterien=', suchkriterien);
        const params = this.suchkriterienToHttpParams(suchkriterien);
        const uri = this.baseUriFilme;
        console.log(`FilmService.find(): uri=${uri}`);

        return (
            this.httpClient
                /* eslint-disable object-curly-newline */
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .get<any>(uri, {
                    params,
                })
                /* eslint-enable object-curly-newline */

                .pipe(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    catchError((err: unknown, _$) => {
                        const errResponse = err as HttpErrorResponse;
                        return of(this.buildFindError(errResponse));
                    }),

                    // entweder Observable<FilmServer[]> oder Observable<FindError>
                    map(result =>
                        this.findResultToFilmArray(result._embedded?.kundeList),
                    ),
                )
        );

        // Same-Origin-Policy verhindert Ajax-Datenabfragen an einen Server in
        // einer anderen Domain. JSONP (= JSON mit Padding) ermoeglicht die
        // Uebertragung von JSON-Daten ueber Domaingrenzen.
        // Falls benoetigt, gibt es in Angular dafuer den Service Jsonp.
    }

    private findResultToFilmArray(
        result: FilmServer[] | FindError,
    ): Film[] | FindError {
        if (result instanceof FindError) {
            return result;
        }
        console.log('result', result);
        const filme = result.map(film => Film.fromServer(film));
        console.log('FilmService.mapFindResult(): filme=', filme);
        return filme;
    }

    /**
     * Ein Film anhand der ID suchen
     * @param id Die ID des gesuchten Films
     */
    findById(id: string | undefined): Observable<Film | FindError> {
        console.log(`FilmService.findById(): id=${id}`);

        if (id === undefined) {
            console.log('FilmService.findById(): Keine Id');
            return of(this.buildFindError());
        }

        // Gibt es ein gepuffertes Film mit der gesuchten ID und Versionsnr.?
        if (
            this._film !== undefined &&
            this._film._id === id &&
            this._film.version !== undefined
        ) {
            console.log(
                `FilmService.findById(): Film gepuffert, version=${this._film.version}`,
            );
            return of(this._film);
        }

        // wegen fehlender Versionsnummer (im ETag) nachladen
        const uri = `${this.baseUriFilme}/${id}`;
        console.log(`FilmService.findById(): uri=${uri}`);

        return (
            this.httpClient
                /* eslint-disable object-curly-newline */
                .get<FilmServer>(uri, {
                    observe: 'response',
                })
                /* eslint-enable object-curly-newline */

                .pipe(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    catchError((err: unknown, _$) => {
                        const errResponse = err as HttpErrorResponse;
                        return of(this.buildFindError(errResponse));
                    }),

                    // entweder Observable<HttpResponse<FilmServer>> oder Observable<FindError>
                    map(result => this.findByIdResultToFilm(result)),
                )
        );
    }

    private findByIdResultToFilm(
        result: HttpResponse<FilmServer> | FindError,
    ): Film | FindError {
        if (result instanceof FindError) {
            return result;
        }

        const { body, headers } = result;
        if (body === null) {
            return this.buildFindError();
        }

        const etag = headers.get('ETag') ?? undefined;
        console.log(`etag = ${etag}`);

        this._film = Film.fromServer(body, etag);
        return this._film;
    }

    /**
     * Einen neuen Film anlegen
     * @param neuenFilm Das JSON-Objekt mit dem neuen Film
     */
    save(film: Film): Observable<string | SaveError> {
        console.log('FilmService.save(): film=', film);
        film.datum = new Date();

        /* eslint-disable @typescript-eslint/naming-convention */
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'text/plain',
        });
        /* eslint-enable @typescript-eslint/naming-convention */

        return this.httpClient
            .post(this.baseUriFilme, film.toJSON(), {
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
        console.log('FilmService.save(): map(): response', response);

        // id aus Header "Locaction" extrahieren
        const location = response.headers.get('Location');
        const id = location?.slice(location.lastIndexOf('/') + 1);

        if (id === undefined) {
            return new SaveError(-1, 'Keine Id');
        }

        return id;
    }

    /**
     * Ein vorhandenes Film aktualisieren
     * @param film Das JSON-Objekt mit den aktualisierten Filmdaten
     */
    update(film: Film): Observable<Film | UpdateError> {
        console.log('FilmService.update(): film=', film);

        const { version } = film;
        if (version === undefined) {
            const msg = `Keine Versionsnummer fuer das Film ${film._id}`;
            console.error(msg);
            return of(new UpdateError(-1, msg));
        }

        const uri = `${this.baseUriFilme}/${film._id}`;
        /* eslint-disable @typescript-eslint/naming-convention */
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'text/plain',
            'If-Match': `"${version}"`,
        });
        /* eslint-enable @typescript-eslint/naming-convention */
        console.log('FilmService.update(): headers=', headers);

        return this.httpClient
            .put(uri, film, { headers, observe: 'response' })
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
                    film.version = versionOderError;
                    return film;
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
        console.log('FilmService.mapUpdateResult(): response', response);
        const etag = response.headers.get('ETag');
        console.log(`FilmService.mapUpdateResult(): etag=${etag}`);

        const ende = etag?.lastIndexOf('"');
        const versionStr = etag?.slice(1, ende) ?? '1';
        return Number.parseInt(versionStr, 10);
    }

    /**
     * Ein Film l&ouml;schen
     * @param film Das JSON-Objekt mit dem zu loeschenden Film
     */
    remove(film: Film): Observable<Record<string, unknown> | RemoveError> {
        console.log('FilmService.remove(): film=', film);
        const uri = `${this.baseUriFilme}/${film._id}`;

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
            'FilmService.suchkriterienToHttpParams(): suchkriterien=',
            suchkriterien,
        );
        let httpParams = new HttpParams();

        if (suchkriterien === undefined) {
            return httpParams;
        }

        const { titel, regisseur, art, schlagwoerter } = suchkriterien;
        const { javascript, typescript } = schlagwoerter;

        if (titel !== '') {
            httpParams = httpParams.set('titel', titel);
        }
        if (art !== '') {
            httpParams = httpParams.set('art', art);
        }
        if (regisseur !== '') {
            httpParams = httpParams.set('regisseur', regisseur);
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
            `FilmService.buildFindError(): status=${status}, Response-Body=`,
            error,
        );
        return new FindError(status, err);
    }
}
/* eslint-enable no-underscore-dangle */
/* eslint-enable max-lines,no-null/no-null */
