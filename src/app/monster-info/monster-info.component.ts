import { Component, Input, OnInit } from '@angular/core';
import { GlobalsService } from '../globals.service';
import { DataLoaderService } from '../data-loader.service';
import { LanguageService } from '../language.service';
import { IMonsterInfo } from '../data-structures/monster-info';
import { IGameInfo } from '../data-structures/game-info';
import { Utils } from '../utils';
import { Attribute, IAttributeInfo } from '../data-structures/attribute-info';

export interface IMonsterInfoViewModel {
    isVisible: boolean;
    deaccentedSearchString: string|null;
    monsterInfo: IMonsterInfo;
}

@Component({
    selector: 'app-monster-info',
    templateUrl: './monster-info.component.html',
    styleUrls: ['./monster-info.component.css']
})
export class MonsterInfoComponent implements OnInit {

    public monsterInfoViewModels: IMonsterInfoViewModel[] | undefined = undefined;

    private _searchFilter = '';
    private _monsterTypes: string[] = [];

    private _totalAttacks: IAttributeInfo[] = [];
    private _averageWeaks: IAttributeInfo[] = [];
    private _monsterCountString = '0';

    public get totalAttacks(): IAttributeInfo[] {
        return this._totalAttacks;
    }
    private setTotalAttacks(attributes: Attribute[]) {
        this._totalAttacks = attributes.map(x => ({ type: x, value: 0}));
    }

    public get averageWeaks(): IAttributeInfo[] {
        return this._averageWeaks;
    }

    public get monsterCountString(): string {
        return this._monsterCountString;
    }

    constructor(
        private globalsService: GlobalsService,
        private dataLoaderService: DataLoaderService,
        public languageService: LanguageService
    ) {
        this.globalsService.registerGameChanged(async (sender, gameInfo) => {
            await this.selectGameInternal(gameInfo);
            this.globalsService.reapplySearchFilter();
            this.updateMonsterCount();
        });

        this.globalsService.registerLanguageChanged(async (sender, language) => {
            await this.selectGameInternal(this.globalsService.selectedGame);
            this.resetDeaccentedSearchStrings();
            this.globalsService.reapplySearchFilter();
            this.updateMonsterCount();
        });

        this.globalsService.registerIsFilterAllLanguagesChanged((sender, value) => {
            this.globalsService.reapplySearchFilter();
            this.updateMonsterCount();
        });

        this.globalsService.registerSearchFilterChanged((sender, value) => {
            this._searchFilter = value;
            this.applySearchFilter();
            this.updateMonsterCount();
        });

        this.globalsService.registerSelectedMonsterTypesChanged((sender, value) => {
            this._monsterTypes = value;
            this.applySearchFilter();
            this.updateMonsterCount();
        });
    }

    private async selectGameInternal(gameInfo: IGameInfo) {

        const filename = `./assets/data/${gameInfo.fileNamePart.toLowerCase()}.json`;

        let monsterInfo: IMonsterInfo[]|null;

        try {
            monsterInfo = await this.dataLoaderService.loadMonsterFile(filename);
        } catch (err) {
            console.error(err);
            return;
        }

        if (!monsterInfo) {
            console.error('Invalid ' + filename + ' monster file');
            return;
        }

        this.monsterInfoViewModels = monsterInfo.map(m => {
            const monsterName = this.languageService.getName(m.names).toLowerCase();
            return {
                isVisible: true,
                deaccentedSearchString: this.deaccentString(monsterName),
                monsterInfo: m
            };
        })
        .sort((a, b) => {
            if (!a || !b) {
                return 0;
            }

            const aStr: string|null = a.deaccentedSearchString;
            const bStr: string|null = b.deaccentedSearchString;

            if (aStr === null || bStr === null) {
                return 0;
            }

            return aStr.localeCompare(bStr);
        });

        this.globalsService.setAvailableMonsterTypes(Utils.distinct(monsterInfo, x => x.type).filter(Boolean));
    }

    private deaccentString(inputs: string): string {

        let result = '';

        for (const input of inputs) {
            const c = input;
            switch (c) {
                case 'à':
                case 'á':
                case 'â':
                case 'ã':
                case 'ä':
                case 'å':
                    result += 'a';
                    break;
                case 'ç':
                    result += 'c';
                    break;
                case 'è':
                case 'é':
                case 'ê':
                case 'ë':
                    result += 'e';
                    break;
                case 'ì':
                case 'í':
                case 'î':
                case 'ï':
                    result += 'i';
                    break;
                case 'ñ':
                    result += 'n';
                    break;
                case 'ò':
                case 'ó':
                case 'ô':
                case 'õ':
                case 'ö':
                case 'ø':
                    result += 'o';
                    break;
                case 'ß':
                    result += 's';
                    break;
                case 'ù':
                case 'ú':
                case 'û':
                case 'ü':
                    result += 'u';
                    break;
                case 'ÿ':
                    result += 'y';
                    break;
                case 'Œ':
                    result += 'oe';
                    break;
                default:
                    result += c;
            }
        }

        return result;
    }

    private resetDeaccentedSearchStrings() {

        if (!this.monsterInfoViewModels) {
            return;
        }

        for (const monsterInfoViewModel of this.monsterInfoViewModels) {
            const monsterName = this.languageService.getName(monsterInfoViewModel.monsterInfo.names).toLowerCase();
            monsterInfoViewModel.deaccentedSearchString = this.deaccentString(monsterName);
        }
    }

    private applySearchFilter() {

        if (!this.monsterInfoViewModels) {
            return;
        }

        if ((!this._searchFilter || this._searchFilter.length === 0) && (!this._monsterTypes || this._monsterTypes.length === 0)) {
            this.showAll();
            return;
        }

        const filters: string[] = this._searchFilter
            .toLowerCase()
            .split(',')
            .map(x => x.trim())
            .filter(x => x.length > 0);

        if (this.globalsService.isFilterAllLanguages) {
            this.applySearchAllLanguages(filters);
        } else {
            this.applySearchCurrentLanguage(filters);
        }
    }

    private updateMonsterCount() {

        if (!this.monsterInfoViewModels) {
            return;
        }

        const monsterSet: Set<string> = new Set<string>();

        let averageWeakCount = 0;
        const averageWeaks: { [key: string]: number; } = {};
        const totalAttacks: Set<Attribute> = new Set<Attribute>();

        for (const monsterInfoViewModel of this.monsterInfoViewModels) {

            if (monsterInfoViewModel.isVisible) {

                const attacks = monsterInfoViewModel.monsterInfo.attacks;
                const weaks = monsterInfoViewModel.monsterInfo.weaks;

                for (const attack of attacks) {
                    totalAttacks.add(attack.type);
                }

                for (const weak of weaks) {
                    const weakTypeStr: string = weak.type.toString();
                    if (averageWeaks[weakTypeStr] === undefined) {
                        averageWeaks[weakTypeStr] = 0;
                    }
                    averageWeaks[weakTypeStr] += weak.value;
                }

                averageWeakCount += 1;

                let name: string | null = monsterInfoViewModel.deaccentedSearchString;
                if (!name) {
                    continue;
                }

                const index = name.indexOf('(');
                if (index >= 0) {
                    name = name.substr(0, index).trim();
                }

                monsterSet.add(name);
            }
        }

        let key: string;

        this.setTotalAttacks(Array.from(totalAttacks.values()).sort((a, b) => a - b));

        this._averageWeaks = [];
        for (key in averageWeaks) {
            if (averageWeaks.hasOwnProperty(key)) {
                this._averageWeaks.push({
                    type: Number.parseInt(key, 10) as Attribute,
                    value: averageWeaks[key] / averageWeakCount
                });
            }
        }

        this.dataLoaderService.normalizeAttributes(this._averageWeaks);

        const visibleMonsterCount: number = monsterSet.size;

        if (visibleMonsterCount === 0) {
            this._monsterCountString = this.languageService.translate('NO_MONSTER');
        } else if (visibleMonsterCount === 1) {
            this._monsterCountString = this.languageService.translate('ONE_MONSTER');
        } else {
            this._monsterCountString = visibleMonsterCount + this.languageService.translate('N_MONSTERS');
        }
    }

    private isMatchingMonsterType(monsterInfo: IMonsterInfoViewModel, monsterTypes: string[]) {
        if (monsterTypes.length === 0) {
            return true;
        }

        return monsterTypes.includes(monsterInfo.monsterInfo.type);
    }

    private applySearchCurrentLanguage(filters: string[]) {

        if (!this.monsterInfoViewModels) {
            return;
        }

        for (const monsterInfoViewModel of this.monsterInfoViewModels) {

            const vm = monsterInfoViewModel;

            if (!this.isMatchingMonsterType(vm, this._monsterTypes)) {
                vm.isVisible = false;
                continue;
            }

            const monsterName = this.languageService.getName(vm.monsterInfo.names).toLowerCase();

            if (!vm.deaccentedSearchString) {
                vm.deaccentedSearchString = this.deaccentString(monsterName);
            }

            const altMonsterName = vm.deaccentedSearchString;

            if (filters.length === 0) {
                vm.isVisible = true;
                continue;
            }

            vm.isVisible = Utils.any(filters, f => {
                if (f[0] === '=') {
                    const exactMatch = f.substring(1).trim();
                    return altMonsterName === exactMatch || monsterName === exactMatch;
                } else {
                    return altMonsterName.indexOf(f) >= 0 || monsterName.indexOf(f) >= 0;
                }
            });
        }
    }

    private applySearchAllLanguages(filters: string[]) {

        if (!this.monsterInfoViewModels) {
            return;
        }

        for (const monsterInfoViewModel of this.monsterInfoViewModels) {

            let isVisible = false;
            const vm = monsterInfoViewModel;

            if (!this.isMatchingMonsterType(vm, this._monsterTypes)) {
                vm.isVisible = false;
                continue;
            }

            for (const rawMonsterName of vm.monsterInfo.names) {

                if (filters.length === 0) {
                    vm.isVisible = true;
                    continue;
                }

                const monsterName = rawMonsterName.value.toLowerCase();
                const altMonsterName = this.deaccentString(monsterName);

                if (Utils.any(filters, f => {
                    if (f[0] === '=') {
                        const exactMatch = f.substring(1).trim();
                        return altMonsterName === exactMatch || monsterName === exactMatch;
                    } else {
                        return altMonsterName.indexOf(f) >= 0 || monsterName.indexOf(f) >= 0;
                    }
                })) {
                    isVisible = true;
                    break;
                }
            }

            vm.isVisible = isVisible;
        }
    }

    private showAll() {

        if (!this.monsterInfoViewModels) {
            return;
        }

        for (const monsterInfoViewModel of this.monsterInfoViewModels) {
            monsterInfoViewModel.isVisible = true;
        }
    }

    ngOnInit() {
    }
}
