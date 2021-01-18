import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    imports: [
        MatCheckboxModule,
        MatIconModule,
        MatToolbarModule,
        FlexLayoutModule,
        MatRadioModule,
        MatButtonModule,
        MatListModule,
        MatSidenavModule,
        MatDialogModule,
        MatCardModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatChipsModule,
        MatAutocompleteModule,
    ],
    exports: [
        MatCheckboxModule,
        MatIconModule,
        MatToolbarModule,
        FlexLayoutModule,
        MatButtonModule,
        MatListModule,
        MatRadioModule,
        MatSidenavModule,
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCardModule,
        MatInputModule,
        MatChipsModule,
        MatAutocompleteModule,
    ],
})
export class MaterialModule {}
