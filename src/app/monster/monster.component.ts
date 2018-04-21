import { Component, Input, OnInit } from '@angular/core';
import { LanguageService } from '../language.service';
import { IMonsterInfoViewModel } from '../monster-info/monster-info.component';
import { GlobalsService } from '../globals.service';
import { IAttributeInfo, Attribute } from '../data-structures/attribute-info';

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

    private isElemental(attr: IAttributeInfo): boolean {
        switch (attr.type) {
            case Attribute.Fire:
            case Attribute.Thunder:
            case Attribute.Water:
            case Attribute.Ice:
            case Attribute.Dragon:
                return true;
        }
        return false;
    }

    public filterElemental(items: IAttributeInfo[]): IAttributeInfo[] {
        return items.filter(this.isElemental);
    }

    public filterNonElemental(items: IAttributeInfo[]): IAttributeInfo[] {
        return items.filter(x => !this.isElemental(x));
    }

    ngOnInit() {
    }
}
