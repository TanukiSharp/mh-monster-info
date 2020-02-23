import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IGameInfo } from './data-structures/game-info';
import { EventHandler, Event } from './utils';
import { LanguageService } from './language.service';
import { IMonsterType } from './data-structures/monster-type';

export type GameChangedHandler = (gameInfo: IGameInfo) => void;
export type LanguageChangedHandler = (language: string) => void;

export enum FilterMode {
    Hide = 'HIDE',
    Shade = 'SHADE'
}

@Injectable()
export class GlobalsService {

    private _availableGames: IGameInfo[] = [
        { fileNamePart: 'mh3u', title: 'MH 3U' },
        { fileNamePart: 'mh4u', title: 'MH 4U' },
        { fileNamePart: 'mhxx', title: 'MH XX' },
        { fileNamePart: 'mhwi', title: 'MH WI' }
    ];

    private _searchFilter = '';
    private _lastSearchFilter: string = this._searchFilter;
    private _searchFilterChangedEvent: Event<string> = new Event<string>();

    private _isMonsterTypeFilteringAvailable: boolean;
    private _availableMonsterTypes: IMonsterType[] = [];
    private _availableMonsterTypesChangedEvent: Event<IMonsterType[]> = new Event<IMonsterType[]>();
    private _selectedMonsterTypes: string[] = [];
    private _selectedMonsterTypesChangedEvent: Event<string[]> = new Event<string[]>();

    private _languageChangedEvent: Event<string> = new Event<string>();
    private _gameChangedEvent: Event<IGameInfo> = new Event<IGameInfo>();
    private _isFilterAllLanguagesChangedEvent: Event<boolean> = new Event<boolean>();

    private _selectedGame: IGameInfo = this._availableGames[0];
    private _selectedLanguage: string = this.languageService.availableLanguages[0];
    private _filterMode: FilterMode = FilterMode.Shade;
    private _isFilterAllLanguages = false;

    // ============================================

    public numberToFilterMode(filterMode: number): FilterMode {
        switch (filterMode) {
            case 1: return FilterMode.Hide;
            case 2: return FilterMode.Shade;
        }
        return FilterMode.Hide;
    }

    public filterModeToNumber(filterMode: FilterMode): number {
        switch (filterMode) {
            case FilterMode.Hide: return 1;
            case FilterMode.Shade: return 2;
        }
        return 1;
    }

    // ============================================

    public get filterMode(): FilterMode {
        return this._filterMode;
    }

    public set filterMode(value: FilterMode) {
        this._filterMode = value;
        this.saveSettings();
        this.reapplySearchFilter();

        this.updateLink();
    }

    public get availableFilterModes(): FilterMode[] {
        return [ FilterMode.Hide, FilterMode.Shade ];
    }

    public isHidden(isVisible: boolean): boolean {
        if (this._filterMode === FilterMode.Hide) {
            return !isVisible;
        }
        return false;
    }

    public isShaded(isVisible: boolean): boolean {
        if (this._filterMode === FilterMode.Shade) {
            return !isVisible;
        }
        return false;
    }

    // ============================================

    public get availableGames(): IGameInfo[] {
        return this._availableGames;
    }

    public isGameAvailable(game: string): boolean {

        game = game.toLowerCase();

        for (const availableGame of this._availableGames) {
            if (availableGame.fileNamePart.toLowerCase() === game) {
                return true;
            }
        }

        return false;
    }

    public selectGameByName(game: string) {

        game = game.toLowerCase();

        for (const availableGame of this._availableGames) {
            if (availableGame.fileNamePart.toLowerCase() === game) {
                this.selectedGame = availableGame;
                return true;
            }
        }

        return false;
    }

    public get selectedGame(): IGameInfo {
        return this._selectedGame;
    }
    public set selectedGame(value: IGameInfo) {
        if (this._selectedGame !== value) {
            this._selectedGame = value;
            this.saveSettings();
            this._gameChangedEvent.raise(this, value);
        }
    }

    public registerGameChanged(handler: EventHandler<IGameInfo>) {
        this._gameChangedEvent.register(handler);
    }

    public unregisterGameChanged(handler: EventHandler<IGameInfo>) {
        this._gameChangedEvent.unregister(handler);
    }

    // ============================================

    public get selectedLanguage(): string {
        return this._selectedLanguage;
    }
    public set selectedLanguage(value: string) {
        if (this._selectedLanguage !== value) {
            this._selectedLanguage = value;
            this.languageService.clearRetardCache();
            this.saveSettings();
            this._languageChangedEvent.raise(this, value);
        }
    }

    public registerLanguageChanged(handler: EventHandler<string>) {
        this._languageChangedEvent.register(handler);
    }

    public unregisterLanguageChanged(handler: EventHandler<string>) {
        this._languageChangedEvent.unregister(handler);
    }

    // ============================================

    public get isFilterAllLanguages(): boolean {
        return this._isFilterAllLanguages;
    }
    public set isFilterAllLanguages(value: boolean) {
        if (this._isFilterAllLanguages !== value) {
            this._isFilterAllLanguages = value;
            this._isFilterAllLanguagesChangedEvent.raise(this, value);
        }
    }

    public registerIsFilterAllLanguagesChanged(handler: EventHandler<boolean>) {
        this._isFilterAllLanguagesChangedEvent.register(handler);
    }

    public unregisterIsFilterAllLanguagesChanged(handler: EventHandler<boolean>) {
        this._isFilterAllLanguagesChangedEvent.unregister(handler);
    }

    // ============================================

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
            this._lastSearchFilter = value;
            this._searchFilterChangedEvent.raise(this, value);

            this.saveSettings();
        }
    }
    public reapplySearchFilter() {
        if (this._lastSearchFilter) {
            this._searchFilterChangedEvent.raise(this, this._lastSearchFilter);
        }
    }

    public registerSearchFilterChanged(handler: EventHandler<string>) {
        this._searchFilterChangedEvent.register(handler);
    }

    public unregisterSearchFilterChanged(handler: EventHandler<string>) {
        this._searchFilterChangedEvent.unregister(handler);
    }

    // ============================================

    public get isMonsterTypeFilteringAvailable(): boolean {
        return this._isMonsterTypeFilteringAvailable;
    }

    private monsterTypeStringToMonsterType(type: string): IMonsterType {
        const display = this.languageService.translate(type.toUpperCase());
        return {
            type,
            display
        };
    }

    public setAvailableMonsterTypes(monsterTypes: string[]): void {
        const mappedMonsterTypes: IMonsterType[] = monsterTypes.map(x => this.monsterTypeStringToMonsterType(x));
        this._availableMonsterTypes = mappedMonsterTypes;
        this._availableMonsterTypesChangedEvent.raise(this, mappedMonsterTypes);
        this._isMonsterTypeFilteringAvailable = monsterTypes.length > 0;
    }

    public get availableMonsterTypes(): IMonsterType[] {
        return this._availableMonsterTypes;
    }

    public get selectedMonsterTypes(): string[] {
        return this._selectedMonsterTypes;
    }
    public set selectedMonsterTypes(monsterTypes: string[]) {
        this._selectedMonsterTypes = monsterTypes;
        this._selectedMonsterTypesChangedEvent.raise(this, monsterTypes);
        this.saveSettings();
    }

    public registerAvailableMonsterTypesChanged(handler: EventHandler<IMonsterType[]>) {
        this._availableMonsterTypesChangedEvent.register(handler);
    }

    public unregisterAvailableMonsterTypesChanged(handler: EventHandler<IMonsterType[]>) {
        this._availableMonsterTypesChangedEvent.unregister(handler);
    }

    public registerSelectedMonsterTypesChanged(handler: EventHandler<string[]>) {
        this._selectedMonsterTypesChangedEvent.register(handler);
    }

    public unregisterSelectedMonsterTypesChanged(handler: EventHandler<string[]>) {
        this._selectedMonsterTypesChangedEvent.unregister(handler);
    }

    // ============================================

    public loadSettings() {

        const value: string = document.cookie;

        if (!value) {
            return;
        }

        const parts: string[] = value.split('|');

        for (const part of parts) {
            if (!part) {
                continue;
            }

            const keyValue: string[] = part.split(':');
            if (keyValue.length !== 2) {
                continue;
            }

            switch (keyValue[0]) {
                case 'game':
                    this.selectGameByName(keyValue[1].toLowerCase());
                    break;
                case 'types':
                    this.selectedMonsterTypes = decodeURIComponent(keyValue[1]).split(';').filter(Boolean);
                    break;
                case 'lang':
                    this.selectedLanguage = keyValue[1].toUpperCase();
                    break;
                case 'filterMode':
                    this.filterMode = keyValue[1].toUpperCase() as FilterMode;
                    break;
            }
        }
    }

    public saveSettings() {

        let value = '';

        if (this.selectedGame) {
            value += `game:${this.selectedGame.fileNamePart}|`;
        }
        if (this.selectedMonsterTypes) {
            value += `types:${encodeURIComponent(this.selectedMonsterTypes.join(';'))}|`;
        }
        if (this.selectedLanguage) {
            value += `lang:${this.selectedLanguage}|`;
        }
        if (this.filterMode) {
            value += `filterMode:${this.filterMode}|`;
        }

        this.updateLink();

        document.cookie = value + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
    }

    private updateLink(): void {

        const game = this.selectedGame.fileNamePart;
        const lang = this.selectedLanguage;
        const types = this.selectedMonsterTypes.join(';');
        const filter = this.searchFilter;
        const fmode = this.filterModeToNumber(this.filterMode).toString();

        const url: string = encodeURI(`?game=${game}&lang=${lang}&filter=${filter}&types=${types}&fmode=${fmode}`);

        this.router.navigateByUrl(url);
    }

    // ============================================

    constructor(private router: Router, private languageService: LanguageService) {
        this._selectedLanguage = this.languageService.availableLanguages[0];
    }
}
