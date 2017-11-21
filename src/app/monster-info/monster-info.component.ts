import { Component, Input, OnInit } from '@angular/core';
import { GlobalsService } from '../globals.service';
import { DataLoaderService } from '../data-loader.service';
import { LanguageService } from '../language.service';
import { IMonsterInfo } from '../data-structures/monster-info';
import { IGameInfo } from '../data-structures/game-info';
import { Utils } from '../utils';

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

    public monsterInfoViewModels: IMonsterInfoViewModel[];

    constructor(
        private globalsService: GlobalsService,
        private dataLoaderService: DataLoaderService,
        private languageService: LanguageService
    ) {
        this.globalsService.registerGameChanged(async (sender, gameInfo) => {
            await this.selectGameInternal(gameInfo);
            this.globalsService.reapplySearchFilter();
        });

        this.globalsService.registerLanguageChanged((sender, language) => {
            this.clearDeaccentedSearchStrings();
            this.globalsService.reapplySearchFilter();
        });

        this.globalsService.registerIsFilterAllLanguagesChanged((sender, value) => {
            this.globalsService.reapplySearchFilter();
        });

        this.globalsService.registerSearchFilterChanged((sender, value) => {
            this.applySearchFilter(value);
        });
    }

    private async selectGameInternal(gameInfo: IGameInfo) {

        let filename = `./assets/data/${gameInfo.fileNamePart.toLowerCase()}.json`;

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
            return {
                isVisible: true,
                deaccentedSearchString: null,
                monsterInfo: m
            };
        });
    }

    private deaccentString(input: string): string {

        let result: string = '';

        for (let i = 0; i < input.length; i += 1) {
            let c = input[i]
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

    private clearDeaccentedSearchStrings() {

        if (!this.monsterInfoViewModels) {
            return;
        }

        for (let i = 0; i < this.monsterInfoViewModels.length; i += 1) {
            this.monsterInfoViewModels[i].deaccentedSearchString = null;
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

        let filters: string[] = value
            .toLowerCase()
            .split(',')
            .map(x => x.trim())
            .filter(x => x.length > 0);

        if (this.globalsService.isFilterAllLanguages) {
            this.applySearchAllLanguages(value, filters);
        } else {
            this.applySearchCurrantLanguage(value, filters);
        }
    }

    private applySearchCurrantLanguage(value: string, filters: string[]) {

        for (let i = 0; i < this.monsterInfoViewModels.length; i += 1) {

            let vm = this.monsterInfoViewModels[i];

            let monsterName = this.languageService.getName(vm.monsterInfo.names).toLowerCase();

            if (!vm.deaccentedSearchString) {
                vm.deaccentedSearchString = this.deaccentString(monsterName);
            }

            let altMonsterName = vm.deaccentedSearchString;

            vm.isVisible = Utils.any(filters, f => {
                if (f[0] === '=') {
                    let exactMatch = f.substring(1).trim();
                    return altMonsterName === exactMatch || monsterName === exactMatch;
                } else {
                    return altMonsterName.indexOf(f) >= 0 || monsterName.indexOf(f) >= 0;
                }
            });
        }
    }

    private applySearchAllLanguages(value: string, filters: string[]) {

        for (let i = 0; i < this.monsterInfoViewModels.length; i += 1) {

            let isVisible: boolean = false;
            let vm = this.monsterInfoViewModels[i];

            for (let j = 0; j < vm.monsterInfo.names.length; j += 1) {

                let monsterName = vm.monsterInfo.names[j].value.toLowerCase();
                let altMonsterName = this.deaccentString(monsterName);

                if (Utils.any(filters, f => {
                    if (f[0] === '=') {
                        let exactMatch = f.substring(1).trim();
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
        for (let i = 0; i < this.monsterInfoViewModels.length; i += 1) {
            this.monsterInfoViewModels[i].isVisible = true;
        }
    }

    ngOnInit() {
    }
}