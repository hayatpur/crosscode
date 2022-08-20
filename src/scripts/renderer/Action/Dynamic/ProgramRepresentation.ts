import { ActionState } from '../Action'
import { Representation } from './Representation'

export class ProgramRepresentation extends Representation {
    constructor(action: ActionState) {
        super(action)

        setTimeout(() => {
            this.createSteps(action)
        })
    }
}
