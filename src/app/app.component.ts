import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { DataLoaderService } from './data-loader.service';
import { GlobalsService } from './globals.service';
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

    private title: string = 'Monster Hunter - Monster Info';

    public versionInfo: string;

    constructor(
        private http: Http,
        public globalsService: GlobalsService,
        public languageService: LanguageService
    ) {
        this.globalsService.registerLanguageChanged((sender, language) => {
            this.languageService.currentLanguage = language;
        });
    }

    private setupInputParameters() {

        let language: string|undefined = undefined;
        let game: string|undefined = undefined;

        let search: string = window.location.search;

        if (!search) {
            return;
        }

        search = search.trim();

        if (search[0] !== '?') {
            return;
        }

        let parts: string[] = search
            .slice(1)
            .toLowerCase()
            .split('&');

        for (let i = 0; i < parts.length; i += 1) {
            let subParts = parts[i].trim().split('=');

            if (subParts.length < 2) {
                continue;
            }

            if (subParts[0] === 'lang') {
                let temp: string = subParts[1].trim().toUpperCase();
                if (this.globalsService.availableLanguages.indexOf(temp) >= 0) {
                    language = temp;
                }
            } else if (subParts[0] === 'game') {
                let temp: string = subParts[1].trim();
                if (this.globalsService.isGameAvailable(temp)) {
                    game = temp;
                }
            }
        }

        if (game) {
            this.globalsService.selectGameByName(game);
        }

        if (language) {
            this.globalsService.selectedLanguage = language;
        }
    }

    async setupVersionInfo() {
        try {
            let response: Response = await this.http.get('./assets/git-info.json').toPromise();
            let jsonRoot: IGitInfo;

            try {
                jsonRoot = response.json();
            } catch (err) {
                console.error(err);
                return null;
            }

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
