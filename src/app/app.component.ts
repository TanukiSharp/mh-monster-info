import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataLoaderService } from './data-loader.service';
import { GlobalsService, FilterMode } from './globals.service';
import { LanguageService } from './language.service';
import { IMonsterInfo } from './data-structures/monster-info';
import { MonsterInfoComponent } from './monster-info/monster-info.component';
import { IGitInfo } from './data-structures/git-info';
import { IGameInfo } from './data-structures/game-info';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [ GlobalsService, DataLoaderService, LanguageService ]
})
export class AppComponent implements OnInit {

    private title = 'Monster Hunter - Monster Info';

    public versionInfo = '-';

    constructor(
        private http: HttpClient,
        public globalsService: GlobalsService,
        public languageService: LanguageService
    ) {
        this.globalsService.registerLanguageChanged((sender, language) => {
            this.languageService.currentLanguage = language;
        });
    }

    private setupInputParameters() {

        let language: string|undefined;
        let game: string|undefined;
        let filter: string|undefined;
        let filterMode: FilterMode|undefined;

        let search: string = window.location.search;

        if (!search) {
            return;
        }

        search = search.trim();

        if (search[0] !== '?') {
            return;
        }

        const parts: string[] = search
            .slice(1)
            .toLowerCase()
            .split('&')
            .map(decodeURI);

        for (let i = 0; i < parts.length; i += 1) {
            const subParts = parts[i].trim().split('=');

            if (subParts.length < 2) {
                continue;
            }

            const argValue: string = subParts[1].trim();

            if (subParts[0] === 'lang') {
                const temp: string = argValue.toUpperCase();
                if (this.globalsService.availableLanguages.indexOf(temp) >= 0) {
                    language = temp;
                }
            } else if (subParts[0] === 'game') {
                if (this.globalsService.isGameAvailable(argValue)) {
                    game = argValue;
                }
            } else if (subParts[0] === 'filter') {
                filter = argValue;
            } else if (subParts[0] === 'fmode') {
                filterMode = this.globalsService.numberToFilterMode(parseInt(argValue, 10));
            }
        }

        if (game) {
            this.globalsService.selectGameByName(game);
        }

        if (language) {
            this.globalsService.selectedLanguage = language;
        }

        if (filter) {
            this.globalsService.searchFilter = filter;
        }

        if (filterMode) {
            this.globalsService.filterMode = filterMode;
        }
    }

    async setupVersionInfo() {
        try {
            const jsonRoot: any = await this.http.get('./assets/git-info.json').toPromise();
            this.versionInfo = jsonRoot.gitRemoteOriginUrl + '\n' + jsonRoot.gitCommit + '\n' + jsonRoot.gitBranch;
        } catch (err) {
            this.versionInfo = err.toString();
        }
    }

    async ngOnInit() {
        this.languageService.currentLanguage = this.globalsService.availableLanguages[0];

        await this.setupVersionInfo();

        this.setupInputParameters();

        this.globalsService.loadSettings();
    }
}
