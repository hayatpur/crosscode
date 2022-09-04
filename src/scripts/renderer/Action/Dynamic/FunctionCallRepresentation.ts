import { ApplicationState } from '../../../ApplicationState'
import { getAccumulatedBoundingBox } from '../../../utilities/action'
import { getConsumedAbyss, getSpatialAbyssControlFlowPoints } from '../Abyss'
import { ActionState } from '../Action'
import { ControlFlowState } from '../Mapping/ControlFlowState'
import { Representation } from './Representation'

export class FunctionCallRepresentation extends Representation {
    sizePerSpatialStep: number = 0.1

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

    consume() {
        const action = ApplicationState.actions[this.actionId]
        action.proxy.container.classList.add('consumed')
    }

    updateSpatialActionProxyPositionChildren(offset: { x: number; y: number }): string[] {
        const action = ApplicationState.actions[this.actionId]

        const rOffset = { x: 50, y: 0 }

        // if (getConsumedAbyss(action.id) != null) {
        //     rOffset.x = 0
        // }

        const spatialIDs: string[] = []

        action.vertices.forEach((id) => {
            const vertex = ApplicationState.actions[id]
            const childSpatialIDs: string[] = []

            const copy = { ...rOffset }
            if (getConsumedAbyss(id) != null && getConsumedAbyss(action.id) != null) {
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

    updateControlFlow(controlFlow: ControlFlowState, originId: string, isSpatiallyConsumed: boolean = false) {
        const action = ApplicationState.actions[this.actionId]

        // console.log(action.id, isSpatiallyConsumed)

        const abyssInfo = getConsumedAbyss(action.id)
        if (!action.isShowingSteps || abyssInfo == null || originId != action.id) {
            super.updateControlFlow(controlFlow, originId, isSpatiallyConsumed)
            return
        }

        const abyss = ApplicationState.abysses[abyssInfo.id]
        const containerBbox = (controlFlow.flowPath.parentElement as HTMLElement).getBoundingClientRect()
        const [abyssStart, abyssEnd] = getSpatialAbyssControlFlowPoints(abyss, action.id)

        abyssStart[0] -= containerBbox.x
        abyssStart[1] -= containerBbox.y
        abyssEnd[0] -= containerBbox.x
        abyssEnd[1] -= containerBbox.y

        this.sizePerSpatialStep = (abyssEnd[0] - abyssStart[0]) / action.spatialVertices.size

        // Add start
        let d = controlFlow.flowPath.getAttribute('d') as string
        d +=
            controlFlow.flowPath.getAttribute('d') == ''
                ? `M ${abyssStart[0]} ${abyssStart[1]}`
                : ` L ${abyssStart[0]} ${abyssStart[1]}`

        controlFlow.flowPath.setAttribute('d', d)
        action.startTime = controlFlow.flowPath.getTotalLength()

        // Add steps
        for (let s = 0; s < action.vertices.length; s++) {
            const stepID = action.vertices[s]
            const step = ApplicationState.actions[stepID]

            // Add start point to path
            step.representation.updateControlFlow(controlFlow, originId, true)
        }

        // Add end
        d = controlFlow.flowPath.getAttribute('d') as string
        d += ` L ${abyssEnd[0]} ${abyssEnd[1]}`
        controlFlow.flowPath.setAttribute('d', d)
        action.endTime = controlFlow.flowPath.getTotalLength()
    }
}
