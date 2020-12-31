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

export enum Verlag {
    FOO_VERLAG = 'FOO_VERLAG',
    BAR_VERLAG = 'BAR_VERLAG',
}

export enum BuchArt {
    KINDLE = 'KINDLE',
    DRUCKAUSGABE = 'DRUCKAUSGABE',
}

// eslint-disable-next-line max-len
export const ISBN_REGEX = /\d{3}-\d-\d{5}-\d{3}-\d|\d-\d{5}-\d{3}-\d|\d-\d{4}-\d{4}-\d|\d{3}-\d{10}/u;

/**
 * Gemeinsame Datenfelder unabh&auml;ngig, ob die Buchdaten von einem Server
 * (z.B. RESTful Web Service) oder von einem Formular kommen.
 */
export interface BuchShared {
    _id?: string; // eslint-disable-line @typescript-eslint/naming-convention
    titel: string | undefined;
    verlag?: Verlag | '';
    art: BuchArt;
    preis: number;
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
export interface BuchServer extends BuchShared {
    rating?: number;
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
export interface BuchForm extends BuchShared {
    rating: string;
    javascript?: boolean;
    typescript?: boolean;
}

/**
 * Model als Plain-Old-JavaScript-Object (POJO) fuer die Daten *UND*
 * Functions fuer Abfragen und Aenderungen.
 */
export class Buch {
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
        public art: BuchArt,
        public verlag: Verlag | undefined | '',
        datum: string | undefined,
        public preis: number,
        public rabatt: number,
        public lieferbar: boolean | undefined,
        public schlagwoerter: string[],
        public isbn: string,
        public version: number | undefined,
    ) {
        // TODO Parsing, ob der Datum-String valide ist
        this.datum = datum === undefined ? new Date() : new Date(datum);
        console.log('Buch(): this=', this);
    }

    /**
     * Ein Buch-Objekt mit JSON-Daten erzeugen, die von einem RESTful Web
     * Service kommen.
     * @param buch JSON-Objekt mit Daten vom RESTful Web Server
     * @return Das initialisierte Buch-Objekt
     */
    static fromServer(buchServer: BuchServer, etag?: string) {
        let selfLink: string | undefined;
        const { _links } = buchServer; // eslint-disable-line @typescript-eslint/naming-convention
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

        const buch = new Buch(
            id,
            buchServer.titel ?? 'unbekannt',
            buchServer.rating,
            buchServer.art,
            buchServer.verlag,
            buchServer.datum,
            buchServer.preis,
            buchServer.rabatt ?? 0,
            buchServer.lieferbar,
            buchServer.schlagwoerter ?? [],
            buchServer.isbn,
            version,
        );
        console.log('Buch.fromServer(): buch=', buch);
        return buch;
    }

    /**
     * Ein Buch-Objekt mit JSON-Daten erzeugen, die von einem Formular kommen.
     * @param buch JSON-Objekt mit Daten vom Formular
     * @return Das initialisierte Buch-Objekt
     */
    static fromForm(buchForm: BuchForm) {
        console.log('Buch.fromForm(): buchForm=', buchForm);
        const schlagwoerter: string[] = [];
        if (buchForm.javascript === true) {
            schlagwoerter.push('JAVASCRIPT');
        }
        if (buchForm.typescript === true) {
            schlagwoerter.push('TYPESCRIPT');
        }

        const rabatt =
            buchForm.rabatt === undefined ? 0 : buchForm.rabatt / 100; // eslint-disable-line @typescript-eslint/no-magic-numbers
        const buch = new Buch(
            buchForm._id,
            buchForm.titel ?? 'unbekannt',
            Number(buchForm.rating),
            buchForm.art,
            buchForm.verlag,
            buchForm.datum,
            buchForm.preis,
            rabatt,
            buchForm.lieferbar,
            schlagwoerter,
            buchForm.isbn,
            buchForm.version,
        );
        console.log('Buch.fromForm(): buch=', buch);
        return buch;
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
     * Abfrage, ob im Buchtitel der angegebene Teilstring enthalten ist. Dabei
     * wird nicht auf Gross-/Kleinschreibung geachtet.
     * @param titel Zu &uuml;berpr&uuml;fender Teilstring
     * @return true, falls der Teilstring im Buchtitel enthalten ist. Sonst
     *         false.
     */
    containsTitel(titel: string) {
        return this.titel.toLowerCase().includes(titel.toLowerCase());
    }

    /**
     * Die Bewertung ("rating") des Buches um 1 erh&ouml;hen
     */
    rateUp() {
        if (this.rating !== undefined && this.rating < MAX_RATING) {
            this.rating++;
        }
    }

    /**
     * Die Bewertung ("rating") des Buches um 1 erniedrigen
     */
    rateDown() {
        if (this.rating !== undefined && this.rating > MIN_RATING) {
            this.rating--;
        }
    }

    /**
     * Abfrage, ob das Buch dem angegebenen Verlag zugeordnet ist.
     * @param verlag der Name des Verlags
     * @return true, falls das Buch dem Verlag zugeordnet ist. Sonst false.
     */
    hasVerlag(verlag: string) {
        return this.verlag === verlag;
    }

    /**
     * Aktualisierung der Stammdaten des Buch-Objekts.
     * @param titel Der neue Buchtitel
     * @param rating Die neue Bewertung
     * @param art Die neue Buchart (DRUCKAUSGABE oder KINDLE)
     * @param verlag Der neue Verlag
     * @param preis Der neue Preis
     * @param rabatt Der neue Rabatt
     */
    // eslint-disable-next-line max-params
    updateStammdaten(
        titel: string,
        art: BuchArt,
        verlag: Verlag | undefined | '',
        rating: number | undefined,
        datum: Date | undefined,
        preis: number,
        rabatt: number,
        isbn: string,
    ) {
        this.titel = titel;
        this.art = art;
        this.verlag = verlag;
        this.rating = rating;
        this.ratingArray =
            rating === undefined
                ? new Array(MAX_RATING - MIN_RATING).fill(false)
                : new Array(rating - MIN_RATING).fill(true);
        this.datum = datum === undefined ? new Date() : datum;
        this.preis = preis;
        this.rabatt = rabatt;
        this.isbn = isbn;
    }

    /**
     * Abfrage, ob es zum Buch auch Schlagw&ouml;rter gibt.
     * @return true, falls es mindestens ein Schlagwort gibt. Sonst false.
     */
    hasSchlagwoerter() {
        return this.schlagwoerter.length !== 0;
    }

    /**
     * Abfrage, ob es zum Buch das angegebene Schlagwort gibt.
     * @param schlagwort das zu &uuml;berpr&uuml;fende Schlagwort
     * @return true, falls es das Schlagwort gibt. Sonst false.
     */
    hasSchlagwort(schlagwort: string) {
        return this.schlagwoerter.includes(schlagwort);
    }

    /**
     * Aktualisierung der Schlagw&ouml;rter des Buch-Objekts.
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
     * Konvertierung des Buchobjektes in ein JSON-Objekt f&uuml;r den RESTful
     * Web Service.
     * @return Das JSON-Objekt f&uuml;r den RESTful Web Service
     */
    toJSON(): BuchServer {
        const datum =
            this.datum === undefined ? undefined : this.datum.toISOString();
        console.log(`toJson(): datum=${datum}`);
        return {
            _id: this._id, // eslint-disable-line @typescript-eslint/naming-convention
            titel: this.titel,
            rating: this.rating,
            art: this.art,
            verlag: this.verlag,
            datum,
            preis: this.preis,
            rabatt: this.rabatt,
            lieferbar: this.lieferbar,
            schlagwoerter: this.schlagwoerter,
            isbn: this.isbn,
        };
    }

    toString() {
        // eslint-disable-next-line no-null/no-null,unicorn/no-null
        return JSON.stringify(this, null, Buch.SPACE);
    }

    private resetSchlagwoerter() {
        this.schlagwoerter = [];
    }

    private addSchlagwort(schlagwort: string) {
        this.schlagwoerter.push(schlagwort);
    }
}
/* eslint-enable max-lines */
