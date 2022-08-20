import { ApplicationState } from '../../../ApplicationState'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class FunctionCallRepresentation extends Representation {
    constructor(action: ActionState) {
        super(action)

        setTimeout(() => {
            this.createSteps(action)

            // If there is only one step, then expand it
            if (action.vertices.length == 1) {
                setTimeout(() => {
                    const step = ApplicationState.actions[action.vertices[0]]
                    step.representation.createSteps(step)

                    step.proxy.element.classList.add('frameless')
                })
            }
        })
    }
}
