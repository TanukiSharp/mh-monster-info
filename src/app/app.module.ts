import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { HttpModule } from '@angular/http';

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
        HttpModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
