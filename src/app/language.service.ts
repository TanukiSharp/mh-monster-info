import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IMonsterName } from './data-structures/monster-name';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { GlobalsService } from './globals.service';

@Injectable()
export class LanguageService {

    private commonData: any;

    private _availableLanguages: string[] = [
        'EN',
        'JP',
        'FR'
    ];

    constructor(private http: HttpClient) {
        this.http.get('./assets/localization.json').subscribe(
            (response: any) => {
            this.commonData = response;
            }
        );
    }

    public currentLanguage: string = this._availableLanguages[0];

    private makeDefaultKey(key: string): string {
        return '<<' + key + '>>';
    }

    private makeDefaultName(names: IMonsterName[]): string {
        return '<< [' + names[0].language + '] ' + names[0].value + '>>';
    }

    public translate(key: string) {

        if (!this.commonData) {
            throw new Error('Language service not yet ready.');
        }

        const language = this.commonData[this.currentLanguage];

        if (!language) {
            return this.makeDefaultKey(key);
        }

        const result = language[key];

        if (!result || result.length === 0) {
            return this.makeDefaultKey(key);
        }

        return result;
    }

    public getName(names: IMonsterName[]): string {

        for (const name of names) {
            if (name.language === this.currentLanguage) {
                return name.value || this.makeDefaultName(names);
            }
        }

        return this.makeDefaultName(names);
    }
}
