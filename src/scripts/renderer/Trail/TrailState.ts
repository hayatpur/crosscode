/* ------------------------------------------------------ */
/*                       Trail State                      */
/* ------------------------------------------------------ */

/* --------------------- Definition --------------------- */

export enum TrailType {
    Create = 'Create',
    Move = 'Move',
    Delete = 'Delete',
}

export interface TrailState {
    fromDataId?: string
    toDataId: string
    type: TrailType
}
