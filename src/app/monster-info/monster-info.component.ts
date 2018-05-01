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

    private _totalAttacks: Attribute[] = [];
    private _averageWeaks: IAttributeInfo[] = [];
    private _monsterCountString = '0';

    public totalAttacks(): Attribute[] {
        return this._totalAttacks;
    }

    public averageWeaks(): IAttributeInfo[] {
        return this._averageWeaks;
    }

    public monsterCountString(): string {
        return this._monsterCountString;
    }

    constructor(
        private globalsService: GlobalsService,
        private dataLoaderService: DataLoaderService,
        private languageService: LanguageService
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
            this.applySearchFilter(value);
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
    }

    private deaccentString(input: string): string {

        let result = '';

        for (let i = 0; i < input.length; i += 1) {
            const c = input[i];
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

        for (let i = 0; i < this.monsterInfoViewModels.length; i += 1) {
            const monsterName = this.languageService.getName(this.monsterInfoViewModels[i].monsterInfo.names).toLowerCase();
            this.monsterInfoViewModels[i].deaccentedSearchString = this.deaccentString(monsterName);
        }
    }

    private applySearchFilter(value: string) {

        if (!this.monsterInfoViewModels) {
            return;
        }

        if (!value || value.length === 0) {
            this.showAll();
            return;
        }

        const filters: string[] = value
            .toLowerCase()
            .split(',')
            .map(x => x.trim())
            .filter(x => x.length > 0);

        if (this.globalsService.isFilterAllLanguages) {
            this.applySearchAllLanguages(value, filters);
        } else {
            this.applySearchCurrentLanguage(value, filters);
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

        for (let i = 0; i < this.monsterInfoViewModels.length; i += 1) {

            if (this.monsterInfoViewModels[i].isVisible) {

                const attacks = this.monsterInfoViewModels[i].monsterInfo.attacks;
                const weaks = this.monsterInfoViewModels[i].monsterInfo.weaks;

                for (let j = 0; j < attacks.length; j += 1) {
                    totalAttacks.add(attacks[j].type);
                }

                for (let j = 0; j < weaks.length; j += 1) {
                    const weakTypeStr: string = weaks[j].type.toString();
                    if (averageWeaks[weakTypeStr] === undefined) {
                        averageWeaks[weakTypeStr] = 0;
                    }
                    averageWeaks[weakTypeStr] += weaks[j].value;
                }

                averageWeakCount += 1;

                let name: string | null = this.monsterInfoViewModels[i].deaccentedSearchString;
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

        this._totalAttacks = [];
        this._averageWeaks = [];

        this._totalAttacks = Array.from(totalAttacks.values());

        for (key in averageWeaks) {
            if (averageWeaks.hasOwnProperty(key)) {
                this._averageWeaks.push({
                    type: <Attribute>Number.parseInt(key, 10),
                    value: averageWeaks[key] / averageWeakCount
                });
            }
        }

        this._totalAttacks.sort((a, b) => a - b);
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

    private applySearchCurrentLanguage(value: string, filters: string[]) {

        if (!this.monsterInfoViewModels) {
            return;
        }

        for (let i = 0; i < this.monsterInfoViewModels.length; i += 1) {

            const vm = this.monsterInfoViewModels[i];

            const monsterName = this.languageService.getName(vm.monsterInfo.names).toLowerCase();

            if (!vm.deaccentedSearchString) {
                vm.deaccentedSearchString = this.deaccentString(monsterName);
            }

            const altMonsterName = vm.deaccentedSearchString;

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

    private applySearchAllLanguages(value: string, filters: string[]) {

        if (!this.monsterInfoViewModels) {
            return;
        }

        for (let i = 0; i < this.monsterInfoViewModels.length; i += 1) {

            let isVisible = false;
            const vm = this.monsterInfoViewModels[i];

            for (let j = 0; j < vm.monsterInfo.names.length; j += 1) {

                const monsterName = vm.monsterInfo.names[j].value.toLowerCase();
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

        for (let i = 0; i < this.monsterInfoViewModels.length; i += 1) {
            this.monsterInfoViewModels[i].isVisible = true;
        }
    }

    ngOnInit() {
    }
}
