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
    }
}
