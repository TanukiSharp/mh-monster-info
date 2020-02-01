import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IMonsterInfo } from './data-structures/monster-info';
import { IMonsterName } from './data-structures/monster-name';
import { Attribute, IAttributeInfo } from './data-structures/attribute-info';

@Injectable()
export class DataLoaderService {

    constructor(private http: HttpClient) { }

    // from attribute to display data
    public attributeToTranslationKey(type: Attribute): string {
        switch (type) {
            case Attribute.Fire: return 'FIRE';
            case Attribute.Water: return 'WATER';
            case Attribute.Thunder: return 'THUNDER';
            case Attribute.Ice: return 'ICE';
            case Attribute.Dragon: return 'DRAGON';
            case Attribute.Poison: return 'POISON';
            case Attribute.NoxiousPoison: return 'NOXIOUS_POISON';
            case Attribute.DeadlyPoison: return 'DEADLY_POISON';
            case Attribute.Sleep: return 'SLEEP';
            case Attribute.Paralysis: return 'PARALYSIS';
            case Attribute.Blast: return 'BLAST';
            case Attribute.Virus: return 'VIRUS';
            case Attribute.Bleeding: return 'BLEEDING';
            case Attribute.Fatigue: return 'FATIGUE';
            case Attribute.Muddy: return 'MUDDY';
            case Attribute.Snowman: return 'SNOWMAN';
            case Attribute.Soiled: return 'SOILED';
            case Attribute.Stun: return 'STUN';
            case Attribute.DefenseDown: return 'DEFENSE_DOWN';
            case Attribute.Confusion: return 'CONFUSION';
            case Attribute.Effluvial: return 'EFFLUVIAL';
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
            case 'effluvial': return Attribute.Effluvial;
        }
        return Attribute.Unknown;
    }

    public normalizeAttributes(attributes: IAttributeInfo[]) {
        if (attributes.length <= 0) {
            return;
        }

        attributes.sort((a, b) => b.value - a.value);

        for (let i = 1; i < attributes.length; i += 1) {
            if (attributes[i].value >= 0) {
                attributes[i].value = Math.round(attributes[i].value * 100 / attributes[0].value);
            }
        }

        if (attributes[0].value >= 0) {
            attributes[0].value = 100;
        }
    }

    async loadMonsterFile(monsterFilename: string): Promise<IMonsterInfo[]|null> {

        const jsonRoot: any[] = await this.http.get(monsterFilename).toPromise() as any[];

        if (jsonRoot.length === undefined) {
            console.error('Invalid root element, must be an array or objects');
            return null;
        }

        const result: IMonsterInfo[] = [];

        for (let i = 0; i < jsonRoot.length; i += 1) {

            if (!jsonRoot[i].names) {
                console.error('Element ' + i + ' does not contains a \'names\' property');
                return null;
            }

            const nameKeys: string[] = Object.keys(jsonRoot[i].names);
            const names: IMonsterName[] = [];

            for (const nameKey of nameKeys) {
                names.push({
                    language: nameKey,
                    value: jsonRoot[i].names[nameKey]
                });
            }

            const attacks: IAttributeInfo[] = [];

            if (jsonRoot[i].attack) {
                const attackKeys: string[] = Object.keys(jsonRoot[i].attack);

                for (const attackKey of attackKeys) {

                    attacks.push({
                        type: this.stringToAttribute(attackKey),
                        value: jsonRoot[i].attack[attackKey]
                    });
                }

                attacks.sort((a, b) => a.value - b.value);
            }

            const weaks: IAttributeInfo[] = [];

            if (jsonRoot[i].weak) {
                const weakKeys: string[] = Object.keys(jsonRoot[i].weak);

                for (const weakKey of weakKeys) {

                    weaks.push({
                        type: this.stringToAttribute(weakKey),
                        value: jsonRoot[i].weak[weakKey]
                    });
                }

                this.normalizeAttributes(weaks);
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
