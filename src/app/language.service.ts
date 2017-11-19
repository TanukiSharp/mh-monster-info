import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { IMonsterName } from './data-structures/monster-name';
import { resetFakeAsyncZone } from '@angular/core/testing';

@Injectable()
export class LanguageService {

    private commonData: any;

    constructor(private http: Http) {
        this.http.get('./assets/localization.json').subscribe((response: Response) =>
        {
            let jsonRoot;
            try {
                jsonRoot = response.json();
            } catch (err) {
                console.error(err);
                return;
            }
            this.commonData = jsonRoot;
        });
    }

    public currentLanguage: string;

    private makeDefaultKey(key: string): string {
        return '<<' + key + '>>';
    }

    private makeDefaultName(names: IMonsterName[]): string {
        return '<< [' + names[0].language + '] ' + names[0].value + '>>';
    }

    public translate(key: string) {

        if (!this.commonData) {
            return null;
        }

        let language = this.commonData[this.currentLanguage];

        if (!language) {
            return this.makeDefaultKey(key);
        }

        let result = language[key];

        if (!result || result.length === 0) {
            return this.makeDefaultKey(key);
        }

        return result;
    }

    public getName(names: IMonsterName[]) {

        for (let i = 0; i < names.length; i += 1) {
            if (names[i].language == this.currentLanguage) {
                return names[i].value || this.makeDefaultName(names);
            }
        }

        return this.makeDefaultName(names);
    }
}
