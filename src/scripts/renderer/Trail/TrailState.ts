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

export type TrailState = {
    fromDataIDs?: string[]
    toDataID: string
    type: TrailType
}
