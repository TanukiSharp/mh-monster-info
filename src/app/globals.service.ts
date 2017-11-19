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

    private _selectedGame: IGameInfo;
    public get selectedGame(): IGameInfo {
        return this._selectedGame;
    }
    public set selectedGame(value: IGameInfo) {
        if (this._selectedGame !== value) {
            this._selectedGame = value;
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

    // ============================================

    constructor() {
        //this._selectedGame = this.availableGames[0];
        this._selectedLanguage = this.availableLanguages[0];
    }
}
