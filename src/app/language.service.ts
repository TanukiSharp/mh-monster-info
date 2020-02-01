import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IMonsterName } from './data-structures/monster-name';
import { PromiseCompletionSource } from './utils';

@Injectable()
export class LanguageService {

    private commonData: any;

    private _availableLanguages: string[] = [
        'EN',
        'JP',
        'FR'
    ];

    private _loaded: PromiseCompletionSource<void>;

    // A retard cache of promise is necessary because Angular's async pipe feature (template stuff) is retard
    // and if the same promise is not always returned, it does retard things, therefore need to cache promises,
    // and clear promises cache when language changes.
    private _retardCache: object = {};

    public get availableLanguages(): string[] {
        return this._availableLanguages;
    }

    constructor(private http: HttpClient) {
        this._loaded = new PromiseCompletionSource<void>();

        this.http.get('./assets/localization.json').subscribe(
            (response: any) => {
                this.commonData = response;
                this._loaded.trySetResult();
            },
            (error: any) => {
                this._loaded.trySetError(error);
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

    public get awaitReady(): Promise<void> {
        return this._loaded.getPromise();
    }

    public clearRetardCache() {
        this._retardCache = {};
    }

    // This intermediate function is necessary for translateAsync to be able to get a promise and cache it.
    private async translateAsyncInternal(key: string): Promise<string> {
        await this._loaded.getPromise();
        const result = this.translate(key);
        return result;
    }

    public translateAsync(key: string): Promise<string> {
        let promise = this._retardCache[key];

        if (!promise) {
            promise = this.translateAsyncInternal(key);
            this._retardCache[key] = promise;
        }

        return promise;
    }

    public translate(key: string): string {
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

    public getMonsterType(type: string): string {
        if (!type) {
            return this.makeDefaultKey('???');
        }

        return this.translate(type.toUpperCase());
    }
}
