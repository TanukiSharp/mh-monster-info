import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { IMonsterInfo } from './data-structures/monster-info';
import { IMonsterName } from './data-structures/monster-name';
import { Attribute, IAttributeInfo } from './data-structures/attribute-info';

@Injectable()
export class DataLoaderService {

    constructor(private http: Http) { }

    // from attribute to display data
    public attributeToString(type: Attribute): string {
        switch (type) {
            case Attribute.Fire: return 'Fire';
            case Attribute.Water: return 'Water';
            case Attribute.Thunder: return 'Thunder';
            case Attribute.Ice: return 'Ice';
            case Attribute.Dragon: return 'Dragon';
            case Attribute.Poison: return 'Poison';
            case Attribute.NoxiousPoison: return 'Noxious Poison';
            case Attribute.DeadlyPoison: return 'Deadly Poison';
            case Attribute.Sleep: return 'Sleep';
            case Attribute.Paralysis: return 'Paralysis';
            case Attribute.Blast: return 'Blast';
            case Attribute.Virus: return 'Virus';
            case Attribute.Bleeding: return 'Bleeding';
            case Attribute.Fatigue: return 'Fatigue';
            case Attribute.Muddy: return 'Muddy';
            case Attribute.Snowman: return 'Snowman';
            case Attribute.Soiled: return 'Soiled';
            case Attribute.Stun: return 'Stun';
            case Attribute.DefenseDown: return 'Defense Down';
            case Attribute.Confusion: return 'Confusion';
        }
        return '?';
    }

    // from data file to attribute
    public stringToAttribute(str: string): Attribute {
        switch (str.toLowerCase()) {
            case 'fire': return Attribute.Fire;
            case 'water': return Attribute.Water;
            case 'thunder': return Attribute.Thunder;
            case 'ice': return Attribute.Ice;
            case 'dragon': return Attribute.Dragon;
            case 'poison': return Attribute.Poison;
            case 'npoison': return Attribute.NoxiousPoison;
            case 'dpoison': return Attribute.DeadlyPoison;
            case 'sleep': return Attribute.Sleep;
            case 'paralysis': return Attribute.Paralysis;
            case 'blast': return Attribute.Blast;
            case 'virus': return Attribute.Virus;
            case 'bleeding': return Attribute.Bleeding;
            case 'fatigue': return Attribute.Fatigue;
            case 'muddy': return Attribute.Muddy;
            case 'snowman': return Attribute.Snowman;
            case 'soiled': return Attribute.Soiled;
            case 'stun': return Attribute.Stun;
            case 'defdown': return Attribute.DefenseDown;
            case 'confusion': return Attribute.Confusion;
        }
        return Attribute.Unknown;
    }

    async loadMonsterFile(monsterFilename: string): Promise<IMonsterInfo[]|null> {

        let response: Response = await this.http.get(monsterFilename).toPromise();
        let jsonRoot: any[];

        try {
            jsonRoot = response.json();
        } catch (err) {
            console.error(err);
            return null;
        }

        if (jsonRoot.length === undefined) {
            console.error('Invalid root element, must be an array or objects');
            return null;
        }

        let result: IMonsterInfo[] = [];

        for (let i = 0; i < jsonRoot.length; i += 1) {

            if (!jsonRoot[i].names) {
                console.error('Element ' + i + ' does not contains a \'names\' property');
                return null;
            }

            let nameKeys: string[] = Object.keys(jsonRoot[i].names);
            let names: IMonsterName[] = [];

            for (let j = 0; j < nameKeys.length; j += 1) {
                names.push({
                    language: nameKeys[j],
                    value: jsonRoot[i].names[nameKeys[j]]
                });
            }

            let attacks: IAttributeInfo[] = [];

            if (jsonRoot[i].attack) {
                let attackKeys: string[] = Object.keys(jsonRoot[i].attack);

                for (let j = 0; j < attackKeys.length; j += 1) {

                    attacks.push({
                        type: this.stringToAttribute(attackKeys[j]),
                        value: jsonRoot[i].attack[attackKeys[j]]
                    });
                }

                attacks.sort((a, b) => a.value - b.value);
            }

            let weaks: IAttributeInfo[] = [];

            if (jsonRoot[i].weak) {
                let weakKeys: string[] = Object.keys(jsonRoot[i].weak);

                for (let j = 0; j < weakKeys.length; j += 1) {

                    weaks.push({
                        type: this.stringToAttribute(weakKeys[j]),
                        value: jsonRoot[i].weak[weakKeys[j]]
                    });
                }

                if (weaks.length > 0) {
                    weaks.sort((a, b) => b.value - a.value);

                    for (let j = 1; j < weakKeys.length; j += 1) {
                        if (weaks[j].value >= 0) {
                            weaks[j].value = Math.round(weaks[j].value * 100 / weaks[0].value);
                        }
                    }

                    if (weaks[0].value >= 0) {
                        weaks[0].value = 100;
                    }
                }
            }

            result.push({
                iconNumber: jsonRoot[i].icon,
                names: names,
                attacks: attacks,
                weaks: weaks
            });
        }

        return result;
    }
}
