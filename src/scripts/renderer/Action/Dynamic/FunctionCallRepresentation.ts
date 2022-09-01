import { ApplicationState } from '../../../ApplicationState'
import { getAccumulatedBoundingBox } from '../../../utilities/action'
import { AbyssKind } from '../Abyss'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class FunctionCallRepresentation extends Representation {
    constructor(action: ActionState) {
        super(action)

        this.shouldHover = true
        this.isSelectableGroup = true
    }

    postCreate() {
        this.createSteps()

        // const action = ApplicationState.actions[this.actionId]

        // If there is only one step, then expand it
        // if (action.vertices.length == 1) {
        //     const step = ApplicationState.actions[action.vertices[0]]
        //     step.representation.createSteps()

        //     // step.proxy.element.classList.add('frameless')
        // }
    }

    updateSpatialActionProxyPositionChildren(offset: { x: number; y: number }): string[] {
        const action = ApplicationState.actions[this.actionId]

        const rOffset = { x: 50, y: 0 }
        const spatialIDs: string[] = []

        action.vertices.forEach((id) => {
            const vertex = ApplicationState.actions[id]
            const childSpatialIDs: string[] = []

            const copy = { ...rOffset }
            if (action.abyssesIds.find((id) => ApplicationState.abysses[id].kind == AbyssKind.Spatial)) {
                copy.x = 0
            }
            childSpatialIDs.push(...vertex.representation.updateSpatialActionProxyPosition(copy))

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
