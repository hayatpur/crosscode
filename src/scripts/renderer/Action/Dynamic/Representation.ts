import { Action } from '../Action'

/* ------------------------------------------------------ */
/*              Abstract representation class             */
/* ------------------------------------------------------ */
export class Representation {
    action: Action
    constructor(action: Action) {
        this.action = action
    }

    destroy() {}
}
