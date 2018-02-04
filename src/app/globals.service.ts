import { Injectable } from '@angular/core';
import { IGameInfo } from './data-structures/game-info';
import { EventHandler, Event } from './utils';

export type GameChangedHandler = (gameInfo: IGameInfo) => void;
export type LanguageChangedHandler = (language: string) => void;

@Injectable()
export class GlobalsService {

    private _availableGames: IGameInfo[] = [
        { fileNamePart: 'mh3u', title: 'MH 3U' },
        { fileNamePart: 'mh4u', title: 'MH 4U' },
        { fileNamePart: 'mhxx', title: 'MH XX' },
        { fileNamePart: 'mhw', title: 'MH World' }
    ];

    private _availableLanguages: string[] = [
        'EN',
        'JP',
        'FR'
    ];

    // ============================================

    public get availableGames(): IGameInfo[] {
        return this._availableGames;
    }

    public isGameAvailable(game: string): boolean {

        game = game.toLowerCase();

        for (let i = 0; i < this._availableGames.length; i += 1) {
            if (this._availableGames[i].fileNamePart.toLowerCase() === game) {
                return true;
            }
        }

        return false;
    }

    public selectGameByName(game: string) {

        game = game.toLowerCase();

        for (let i = 0; i < this._availableGames.length; i += 1) {
            if (this._availableGames[i].fileNamePart.toLowerCase() === game) {
                this.selectedGame = this._availableGames[i];
                return true;
            }
        }

        return false;
    }

    private _selectedGame: IGameInfo;
    public get selectedGame(): IGameInfo {
        return this._selectedGame;
    }
    public set selectedGame(value: IGameInfo) {
        if (this._selectedGame !== value) {
            this._selectedGame = value;
            this.saveSettings();
            this.gameChangedEvent.raise(this, value);
        }
    }

    private gameChangedEvent: Event<IGameInfo> = new Event<IGameInfo>();

    public registerGameChanged(handler: EventHandler<IGameInfo>) {
        this.gameChangedEvent.register(handler);
    }

    public unregisterGameChanged(handler: EventHandler<IGameInfo>) {
        this.gameChangedEvent.unregister(handler);
    }

    // ============================================

    public get availableLanguages(): string[] {
        return this._availableLanguages;
    }

    private _selectedLanguage: string;
    public get selectedLanguage(): string {
        return this._selectedLanguage;
    }
    public set selectedLanguage(value: string) {
        if (this._selectedLanguage !== value) {
            this._selectedLanguage = value;
            this.saveSettings();
            this.languageChangedEvent.raise(this, value);
        }
    }

    private languageChangedEvent: Event<string> = new Event<string>();

    public registerLanguageChanged(handler: EventHandler<string>) {
        this.languageChangedEvent.register(handler);
    }

    public unregisterLanguageChanged(handler: EventHandler<string>) {
        this.languageChangedEvent.unregister(handler);
    }

    // ============================================

    private _isFilterAllLanguages: boolean;
    public get isFilterAllLanguages(): boolean {
        return this._isFilterAllLanguages;
    }
    public set isFilterAllLanguages(value: boolean) {
        if (this._isFilterAllLanguages !== value) {
            this._isFilterAllLanguages = value;
            this.isFilterAllLanguagesChangedEvent.raise(this, value);
        }
    }

    private isFilterAllLanguagesChangedEvent: Event<boolean> = new Event<boolean>();

    public registerIsFilterAllLanguagesChanged(handler: EventHandler<boolean>) {
        this.isFilterAllLanguagesChangedEvent.register(handler);
    }

    public unregisterIsFilterAllLanguagesChanged(handler: EventHandler<boolean>) {
        this.isFilterAllLanguagesChangedEvent.unregister(handler);
    }

    // ============================================

    private lastSearchFilter: string;

    private searchFilterChangedEvent: Event<string> = new Event<string>();

    private _searchFilter: string;
    public get searchFilter(): string {
        return this._searchFilter;
    }
    public set searchFilter(value: string) {
        if (value) {
            // support Japanese input
            value = value.replace('、', ',').replace('＝', '=');
        }

        if (this._searchFilter !== value) {
            this._searchFilter = value;
            this.lastSearchFilter = value;
            this.searchFilterChangedEvent.raise(this, value);
        }
    }
    public reapplySearchFilter() {
        if (this.lastSearchFilter) {
            this.searchFilterChangedEvent.raise(this, this.lastSearchFilter);
        }
    }

    public registerSearchFilterChanged(handler: EventHandler<string>) {
        this.searchFilterChangedEvent.register(handler);
    }

    public unregisterSearchFilterChanged(handler: EventHandler<string>) {
        this.searchFilterChangedEvent.unregister(handler);
    }

    public loadSettings() {

        let value: string = document.cookie;

        if (!value) {
            return;
        }

        let parts: string[] = value.split('|');

        for (let i: number = 0; i < parts.length; i += 1) {
            let part: string = parts[i];
            if (!part) {
                continue;
            }

            let keyValue: string[] = part.split(':');
            if (keyValue.length != 2) {
                continue;
            }

            switch (keyValue[0]) {
                case 'game':
                    this.selectGameByName(keyValue[1].toLowerCase());
                    break;
                case 'lang':
                    this.selectedLanguage = keyValue[1].toUpperCase();
                    break;
                case 'filterMode':
                    this.filterMode = <FilterMode>keyValue[1].toUpperCase();
                    break;
            }
        }
    }

    public saveSettings() {

        let value: string = '';

        if (this.selectedGame) {
            value += `game:${this.selectedGame.fileNamePart}|`;
        }
        if (this.selectedLanguage) {
            value += `lang:${this.selectedLanguage}|`;
        }
        if (this.filterMode) {
            value += `filterMode:${this.filterMode}|`;
        }

        document.cookie = value + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
    }

    // ============================================

    constructor() {
        //this._selectedGame = this.availableGames[0];
        this._selectedLanguage = this.availableLanguages[0];
    }
}
