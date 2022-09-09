import { ApplicationState } from '../../../ApplicationState'
import { getConsumedAbyss } from '../Abyss'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class AssignmentExpressionRepresentation extends Representation {
    constructor(action: ActionState) {
        super(action)
        this.shouldHover = true
    }

    getControlFlowPoints(
        usePlaceholder: boolean = true,
        referencePoint: { x: number; y: number } = { x: 0, y: 0 }
    ): [number, number][] | null {
        const action = ApplicationState.actions[this.actionId]
        const abyssInfo = getConsumedAbyss(action.id)

        if (abyssInfo != null && !action.isSpatial) {
            // Find the abyss that it's in
            return super.getControlFlowPoints(usePlaceholder)
        }

        const parent = ApplicationState.actions[action.parentID!]

        if (
            action.execution.nodeData.preLabel == 'Update' &&
            parent.execution.nodeData.type == 'ForStatement' &&
            !action.isShowingSteps
        ) {
            let bbox = action.proxy.element.getBoundingClientRect()

            const offset = Math.min(2, bbox.height * 0.1)

            return [
                [bbox.x + bbox.width, bbox.y + bbox.height / 2],
                [bbox.x, bbox.y + bbox.height / 2],
            ]
        } else {
            return super.getControlFlowPoints(usePlaceholder)
        }
    }

    createSteps(): void {
        super.createSteps()

        const action = ApplicationState.actions[this.actionId]
        const proxy = action.proxy

        // Swap second and third child in the proxy
        const secondChild = proxy.element.children[1]
        const thirdChild = proxy.element.children[2]
        proxy.element.insertBefore(thirdChild, secondChild)

        console.log('Runs...')
    }
}
