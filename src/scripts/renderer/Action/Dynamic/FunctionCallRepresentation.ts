import { ApplicationState } from '../../../ApplicationState'
import { getAccumulatedBoundingBox } from '../../../utilities/action'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class FunctionCallRepresentation extends Representation {
    constructor(action: ActionState) {
        super(action)
    }

    postCreate() {
        this.createSteps()

        const action = ApplicationState.actions[this.actionId]

        // If there is only one step, then expand it
        if (action.vertices.length == 1) {
            const step = ApplicationState.actions[action.vertices[0]]
            step.representation.createSteps()

            step.proxy.element.classList.add('frameless')
        }
    }

    updateSpatialActionProxyPositionChildren(offset: { x: number; y: number }): string[] {
        const action = ApplicationState.actions[this.actionId]

        const rOffset = { x: 50, y: 0 }
        const spatialIDs: string[] = []

        action.vertices.forEach((id) => {
            const vertex = ApplicationState.actions[id]
            const childSpatialIDs: string[] = []
            childSpatialIDs.push(...vertex.representation.updateSpatialActionProxyPosition({ ...rOffset }))

            // If hit something
            if (childSpatialIDs.length > 0) {
                const bbox = getAccumulatedBoundingBox(childSpatialIDs)
                rOffset.y += bbox.height + 20
            }

            spatialIDs.push(...childSpatialIDs)
        })

        return spatialIDs
    }
}
