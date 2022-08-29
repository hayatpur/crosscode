import { ApplicationState } from '../../../ApplicationState'
import { getAccumulatedBoundingBox } from '../../../utilities/action'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class ProgramRepresentation extends Representation {
    constructor(action: ActionState) {
        super(action)

        setTimeout(() => {
            this.createSteps()
        })
    }

    updateSpatialActionProxyPositionChildren(offset: { x: number; y: number }): string[] {
        const action = ApplicationState.actions[this.actionId]

        const rOffset = { x: 50, y: 0 }
        const spatialIDs: string[] = []

        action.vertices.forEach((id) => {
            const vertex = ApplicationState.actions[id]
            spatialIDs.push(...vertex.representation.updateSpatialActionProxyPosition({ ...rOffset }))

            // If hit something
            if (spatialIDs.length > 0) {
                const bbox = getAccumulatedBoundingBox(spatialIDs)
                rOffset.y += bbox.height + 20
            }
        })

        return spatialIDs
    }

    clicked() {
        return false
    }
}
