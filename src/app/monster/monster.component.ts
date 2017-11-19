import { Component, Input, OnInit } from '@angular/core';
import { LanguageService } from '../language.service';
import { IMonsterInfoViewModel } from '../monster-info/monster-info.component';
import { GlobalsService } from '../globals.service';

@Component({
    selector: 'app-monster',
    templateUrl: './monster.component.html',
    styleUrls: ['./monster.component.css']
})
export class MonsterComponent implements OnInit {

    @Input()
    public monsterInfoViewModel: IMonsterInfoViewModel;

    constructor(
        public languageService: LanguageService,
        public globalsService: GlobalsService
    ) {
    }

    ngOnInit() {
    }
}
