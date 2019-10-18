export enum Attribute {
    Unknown,
    Fire,
    Water,
    Thunder,
    Ice,
    Dragon,
    Poison,
    NoxiousPoison,
    DeadlyPoison,
    Sleep,
    Paralysis,
    Blast,
    Virus,
    Bleeding,
    Fatigue,
    Muddy,
    Snowman,
    Soiled,
    Stun,
    DefenseDown,
    Confusion,
    Effluvial
}

export interface IAttributeInfo {
    type: Attribute;
    value: number;
}
