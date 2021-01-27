/* eslint-disable max-lines */
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

const MIN_RATING = 0;
const MAX_RATING = 5;

export enum Filmstudio {
    UNIVERSAL_STUDIOSLAG = 'UNIVERSAL_STUDIOSLAG',
    WARNER_BROS = 'WARNER_BROS',
}

export enum FilmArt {
    DREIDIMENSIONAL = '3D',
    ZWEIDIMENSIONAL = '2D',
}

// eslint-disable-next-line max-len
export const ISBN_REGEX = /\d{3}-\d-\d{5}-\d{3}-\d|\d-\d{5}-\d{3}-\d|\d-\d{4}-\d{4}-\d|\d{3}-\d{10}/u;

/**
 * Gemeinsame Datenfelder unabh&auml;ngig, ob die Filmdaten von einem Server
 * (z.B. RESTful Web Service) oder von einem Formular kommen.
 */
export interface FilmShared {
    _id?: string; // eslint-disable-line @typescript-eslint/naming-convention
    titel: string | undefined;
    filmstudio?: Filmstudio | '';
    art: FilmArt;
    umsatz: number;
    rabatt: number | undefined;
    datum?: string;
    lieferbar?: boolean;
    isbn: string;
    version?: number;
}

interface Link {
    href: string;
}

/**
 * Daten vom und zum REST-Server:
 * <ul>
 *  <li> Arrays f&uuml;r mehrere Werte, die in einem Formular als Checkbox
 *       dargestellt werden.
 *  <li> Daten mit Zahlen als Datentyp, die in einem Formular nur als
 *       String handhabbar sind.
 * </ul>
 */
export interface FilmServer extends FilmShared {
    rating?: number;
    username?: string;
    familienstand?: string;
    geschlecht?: string;
    geburtsdatum?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adresse?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    umsatz: any;
    interessen?: string[];
    homepage?: string;
    email?: string;
    bewertung?: number;
    newsletter?: boolean;
    schlagwoerter?: string[];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _links?: {
        self: Link;
        list?: Link;
        add?: Link;
        update?: Link;
        remove?: Link;
    };
}

/**
 * Daten aus einem Formular:
 * <ul>
 *  <li> je 1 Control fuer jede Checkbox und
 *  <li> au&szlig;erdem Strings f&uuml;r Eingabefelder f&uuml;r Zahlen.
 * </ul>
 */
export interface FilmForm extends FilmShared {
    rating: string;
    javascript?: boolean;
    typescript?: boolean;
}

/**
 * Model als Plain-Old-JavaScript-Object (POJO) fuer die Daten *UND*
 * Functions fuer Abfragen und Aenderungen.
 */
export class Film {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private static readonly SPACE = 2;

    ratingArray: boolean[] =
        this.rating === undefined
            ? new Array(MAX_RATING - MIN_RATING).fill(false)
            : new Array(this.rating - MIN_RATING)
                  .fill(true)
                  .concat(new Array(MAX_RATING - this.rating).fill(false));

    datum: Date | undefined;

    // wird aufgerufen von fromServer() oder von fromForm()
    // eslint-disable-next-line max-params
    private constructor(
        public _id: string | undefined, // eslint-disable-line @typescript-eslint/naming-convention
        public titel: string,
        public rating: number | undefined,
        public art: FilmArt,
        public filmstudio: Filmstudio | undefined | '',
        datum: string | undefined,
        public umsatz: number,
        public rabatt: number,
        public lieferbar: boolean | undefined,
        public schlagwoerter: string[],
        public isbn: string,
        public version: number | undefined,
    ) {
        // TODO Parsing, ob der Datum-String valide ist
        this.datum = datum === undefined ? new Date() : new Date(datum);
        console.log('Film(): this=', this);
    }

    /**
     * Ein Film-Objekt mit JSON-Daten erzeugen, die von einem RESTful Web
     * Service kommen.
     * @param film JSON-Objekt mit Daten vom RESTful Web Server
     * @return Das initialisierte Film-Objekt
     */
    static fromServer(filmServer: FilmServer, etag?: string) {
        let selfLink: string | undefined;
        const { _links } = filmServer; // eslint-disable-line @typescript-eslint/naming-convention
        if (_links !== undefined) {
            const { self } = _links;
            selfLink = self.href;
        }
        let id: string | undefined;
        if (selfLink !== undefined) {
            const lastSlash = selfLink.lastIndexOf('/');
            id = selfLink.slice(lastSlash + 1);
        }

        let version: number | undefined;
        if (etag !== undefined) {
            // Anfuehrungszeichen am Anfang und am Ende entfernen
            const versionStr = etag.slice(1, -1);
            version = Number.parseInt(versionStr, 10);
        }

        const film = new Film(
            id,
            filmServer.titel ?? 'unbekannt',
            filmServer.rating,
            filmServer.art,
            filmServer.filmstudio,
            filmServer.datum,
            filmServer.umsatz,
            filmServer.rabatt ?? 0,
            filmServer.lieferbar,
            filmServer.schlagwoerter ?? [],
            filmServer.isbn,
            version,
        );
        console.log('Film.fromServer(): film=', film);
        return film;
    }

    /**
     * Ein Film-Objekt mit JSON-Daten erzeugen, die von einem Formular kommen.
     * @param film JSON-Objekt mit Daten vom Formular
     * @return Das initialisierte Film-Objekt
     */
    static fromForm(filmForm: FilmForm) {
        console.log('Film.fromForm(): filmForm=', filmForm);
        const schlagwoerter: string[] = [];
        if (filmForm.javascript === true) {
            schlagwoerter.push('JAVASCRIPT');
        }
        if (filmForm.typescript === true) {
            schlagwoerter.push('TYPESCRIPT');
        }

        const rabatt =
            filmForm.rabatt === undefined ? 0 : filmForm.rabatt / 100; // eslint-disable-line @typescript-eslint/no-magic-numbers
        const film = new Film(
            filmForm._id,
            filmForm.titel ?? 'unbekannt',
            Number(filmForm.rating),
            filmForm.art,
            filmForm.filmstudio,
            filmForm.datum,
            filmForm.umsatz,
            rabatt,
            filmForm.lieferbar,
            schlagwoerter,
            filmForm.isbn,
            filmForm.version,
        );
        console.log('Film.fromForm(): film=', film);
        return film;
    }

    // Property in TypeScript wie in C#
    // https://www.typescriptlang.org/docs/handbook/classes.html#accessors
    get datumFormatted() {
        // z.B. 7. Mai 2020
        const formatter = new Intl.DateTimeFormat('de', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return this.datum === undefined ? '' : formatter.format(this.datum);
    }

    /**
     * Abfrage, ob im Filmtitel der angegebene Teilstring enthalten ist. Dabei
     * wird nicht auf Gross-/Kleinschreibung geachtet.
     * @param titel Zu &uuml;berpr&uuml;fender Teilstring
     * @return true, falls der Teilstring im Filmtitel enthalten ist. Sonst
     *         false.
     */
    containsTitel(titel: string) {
        return this.titel.toLowerCase().includes(titel.toLowerCase());
    }

    /**
     * Die Bewertung ("rating") des Filmes um 1 erh&ouml;hen
     */
    rateUp() {
        if (this.rating !== undefined && this.rating < MAX_RATING) {
            this.rating++;
        }
    }

    /**
     * Die Bewertung ("rating") des Filmes um 1 erniedrigen
     */
    rateDown() {
        if (this.rating !== undefined && this.rating > MIN_RATING) {
            this.rating--;
        }
    }

    /**
     * Abfrage, ob das Film dem angegebenen Filmstudio zugeordnet ist.
     * @param filmstudio der Name des Filmstudios
     * @return true, falls das Film dem Filmstudio zugeordnet ist. Sonst false.
     */
    hasFilmstudio(filmstudio: string) {
        return this.filmstudio === filmstudio;
    }

    /**
     * Aktualisierung der Stammdaten des Film-Objekts.
     * @param titel Der neue Filmtitel
     * @param rating Die neue Bewertung
     * @param art Die neue Filmart (2D oder 3D)
     * @param filmstudio Der neue Filmstudio
     * @param umsatz Der neue Umsatz
     * @param rabatt Der neue Rabatt
     */
    // eslint-disable-next-line max-params
    updateStammdaten(
        titel: string,
        art: FilmArt,
        filmstudio: Filmstudio | undefined | '',
        rating: number | undefined,
        datum: Date | undefined,
        umsatz: number,
        rabatt: number,
        isbn: string,
    ) {
        this.titel = titel;
        this.art = art;
        this.filmstudio = filmstudio;
        this.rating = rating;
        this.ratingArray =
            rating === undefined
                ? new Array(MAX_RATING - MIN_RATING).fill(false)
                : new Array(rating - MIN_RATING).fill(true);
        this.datum = datum === undefined ? new Date() : datum;
        this.umsatz = umsatz;
        this.rabatt = rabatt;
        this.isbn = isbn;
    }

    /**
     * Abfrage, ob es zum Film auch Schlagw&ouml;rter gibt.
     * @return true, falls es mindestens ein Schlagwort gibt. Sonst false.
     */
    hasSchlagwoerter() {
        return this.schlagwoerter.length !== 0;
    }

    /**
     * Abfrage, ob es zum Film das angegebene Schlagwort gibt.
     * @param schlagwort das zu &uuml;berpr&uuml;fende Schlagwort
     * @return true, falls es das Schlagwort gibt. Sonst false.
     */
    hasSchlagwort(schlagwort: string) {
        return this.schlagwoerter.includes(schlagwort);
    }

    /**
     * Aktualisierung der Schlagw&ouml;rter des Film-Objekts.
     * @param javascript ist das Schlagwort JAVASCRIPT gesetzt
     * @param typescript ist das Schlagwort TYPESCRIPT gesetzt
     */
    updateSchlagwoerter(javascript: boolean, typescript: boolean) {
        this.resetSchlagwoerter();
        if (javascript) {
            this.addSchlagwort('JAVASCRIPT');
        }
        if (typescript) {
            this.addSchlagwort('TYPESCRIPT');
        }
    }

    /**
     * Konvertierung des Filmobjektes in ein JSON-Objekt f&uuml;r den RESTful
     * Web Service.
     * @return Das JSON-Objekt f&uuml;r den RESTful Web Service
     */
    toJSON(): FilmServer {
        const datum =
            this.datum === undefined ? undefined : this.datum.toISOString();
        console.log(`toJson(): datum=${datum}`);
        return {
            _id: this._id, // eslint-disable-line @typescript-eslint/naming-convention
            titel: this.titel,
            art: this.art,
            rating: this.rating,
            // email: `test${Math.random()}@test.de`,
            email: 'Theo@Test.de.put',
            username: this.filmstudio,
            datum,
            rabatt: this.rabatt,
            schlagwoerter: this.schlagwoerter,
            isbn: this.isbn,
            bewertung: 1,
            newsletter: true,
            geburtsdatum: '2017-01-31',
            umsatz: {
                betrag: 0,
                waehrung: 'EUR',
            },
            homepage: 'https://www.test.de',
            geschlecht: 'W',
            familienstand: 'L',
            interessen: ['R', 'L'],
            adresse: {
                plz: '12345',
                ort: 'Testort',
            },
        };
    }

    toString() {
        // eslint-disable-next-line no-null/no-null,unicorn/no-null
        return JSON.stringify(this, null, Film.SPACE);
    }

    private resetSchlagwoerter() {
        this.schlagwoerter = [];
    }

    private addSchlagwort(schlagwort: string) {
        this.schlagwoerter.push(schlagwort);
    }
}
/* eslint-enable max-lines */
