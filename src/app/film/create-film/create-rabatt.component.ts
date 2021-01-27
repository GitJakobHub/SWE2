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

import { Component, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import type { FormGroup } from '@angular/forms';
import type { OnInit } from '@angular/core';

/**
 * Komponente mit dem Tag &lt;hs-create-rabatt&gt;, um das Erfassungsformular
 * f&uuml;r einen neuen Film zu realisieren.
 */
@Component({
    selector: 'hs-create-rabatt',
    templateUrl: './create-rabatt.component.html',
})
export class CreateRabattComponent implements OnInit {
    @Input()
    form!: FormGroup;

    readonly rabatt = new FormControl(undefined, Validators.required);

    ngOnInit() {
        console.log('CreateRabattComponent.ngOnInit');
        // siehe formControlName innerhalb @Component({templateUrl: ...})
        this.form.addControl('rabatt', this.rabatt);
    }
}

/*
<div class="row">
  <label for="rabattInput" class="col col-2 col-form-label gy-3"
    >Rabatt *</label
  >
  <div class="col col-10 gy-3" [formGroup]="form">
    <div class="input-group">
      <input
        id="rabattInput"
        placeholder="Rabatt in Prozent, z.B. 10.00"
        required
        type="number"
        class="form-control"
        formControlName="rabatt"
        [class.is-invalid]="rabatt.invalid && rabatt.touched"
        [class.is-valid]="rabatt.valid && rabatt.touched"
      />
      <span class="input-group-addon ml-1">%</span>
    </div>

    <div *ngIf="rabatt.invalid && rabatt.touched" class="invalid-feedback">
      <div *ngIf="rabatt.errors && rabatt.errors.required">
        <i class="material-icons">error</i>
        <span class="ml-1">
          Der Rabatt muss als Prozentwert eigegebenen werden, z.B. 10.00
        </span>
      </div>
    </div>
  </div>
</div>
*/
