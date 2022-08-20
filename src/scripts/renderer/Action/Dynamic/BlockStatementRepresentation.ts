import { getExecutionSteps } from '../../../utilities/action'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class BlockStatementRepresentation extends Representation {
    constructor(action: ActionState) {
        super(action)

        // If there is only one step, then expand it
        if (getExecutionSteps(action.execution).length == 1) {
            setTimeout(() => {
                this.createSteps(action)
            })
        }
    }
}
