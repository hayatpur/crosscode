/* ------------------------------------------------------ */
/*                       Trail State                      */
/* ------------------------------------------------------ */

/* --------------------- Definition --------------------- */

export enum TrailType {
    Create = 'Create',
    Move = 'Move',
    Delete = 'Delete',

    PartialMove = 'PartialMove',
    PartialCreate = 'PartialCreate',
}

export interface TrailState {
    fromDataIDs?: string[]
    toDataID: string
    type: TrailType
}
