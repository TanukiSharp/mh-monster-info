import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

import { AppComponent } from './app.component';
import { MonsterInfoComponent } from './monster-info/monster-info.component';
import { MonsterComponent } from './monster/monster.component';
import { AttributeComponent } from './attribute/attribute.component';
import { TooltipComponent } from './tooltip/tooltip.component';

@NgModule({
    declarations: [
        AppComponent,
        MonsterInfoComponent,
        MonsterComponent,
        AttributeComponent,
        TooltipComponent
    ],
    imports: [
        FormsModule,
        BrowserModule,
        NgSelectModule,
        HttpClientModule,
        RouterModule.forRoot([{ path: '', component: AppComponent}])
    ],
    providers: [],
    bootstrap: [AppComponent]
})

export class AppModule { }
