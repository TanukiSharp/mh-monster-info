import { IMonsterName } from './monster-name';
import { IAttributeInfo } from './attribute-info';

export interface IMonsterInfo {
    iconNumber: number;
    names: IMonsterName[];
    attacks: IAttributeInfo[];
    weaks: IAttributeInfo[];
}
