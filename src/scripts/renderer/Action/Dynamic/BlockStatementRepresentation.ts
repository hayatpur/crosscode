import { ApplicationState } from '../../../ApplicationState'
import { getExecutionSteps } from '../../../utilities/action'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class BlockStatementRepresentation extends Representation {
    constructor(action: ActionState) {
        super(action)

        this.shouldHover = true
    }

    postCreate(): void {
        const action = ApplicationState.actions[this.actionId]

        // If there is only one step, then expand it
        const executionSteps = getExecutionSteps(action.execution)
        if (executionSteps.length == 1 && action.execution.nodeData.preLabel != 'Body') {
            this.createSteps()

            if (executionSteps[0].nodeData.preLabel != 'IfStatement') {
                action.proxy.container.classList.add('is-singular')
            }
        }
    }
}
