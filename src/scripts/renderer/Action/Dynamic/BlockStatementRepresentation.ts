import { ApplicationState } from '../../../ApplicationState'
import { getExecutionSteps } from '../../../utilities/action'
import { getConsumedAbyss } from '../Abyss'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class BlockStatementRepresentation extends Representation {
    constructor(action: ActionState) {
        super(action)

        this.shouldHover = true
        this.isSelectableGroup = true
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

    getControlFlowPoints(usePlaceholder: boolean = true): [number, number][] | null {
        if (this.isTrimmed) {
            return null
        }

        const action = ApplicationState.actions[this.actionId]
        const abyssInfo = getConsumedAbyss(action.id)

        if (abyssInfo != null && !action.isSpatial) {
            // Find the abyss that it's in
            return super.getControlFlowPoints(usePlaceholder)
        }

        const parent = ApplicationState.actions[action.parentID!]

        if (
            action.execution.nodeData.preLabel == 'Body' &&
            parent.execution.nodeData.type == 'ForStatement' &&
            !action.isShowingSteps
        ) {
            let bbox = action.proxy.element.getBoundingClientRect()

            const offset = Math.min(2, bbox.height * 0.1)

            return [
                [bbox.x + bbox.width / 2, bbox.y],
                [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2],
                [bbox.x + bbox.width, bbox.y + bbox.height / 2],
            ]
        } else {
            return super.getControlFlowPoints(usePlaceholder)
        }
    }
}
