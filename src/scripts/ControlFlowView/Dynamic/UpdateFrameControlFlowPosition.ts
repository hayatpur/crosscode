import { assert } from '../../../utilities/generic'
import { getNumericalValueOfStyle, overLerp } from '../../../utilities/math'
import { Steps } from '../Step'

export function updateFrameControlFlowPosition(stepId: string, offset: { x: number; y: number }) {
    const step = Steps.get(stepId)

    const spatialIDs = []

    // Update self
    if (step.isFrame) {
        if (step.execution.nodeData.type == 'Program') {
            step.controlFlow.container.style.left = `${offset.x}px`
            step.controlFlow.container.style.top = `${offset.y}px`
        } else {
            assert(step.parentId != null, 'Non-program action has no parent.')
            const parent = Steps.get(step.parentId)

            assert(parent.parentFrameId != null, 'Non-program action has no spatial parent.')
            const spatialParent = Steps.get(parent.parentFrameId)
            let spatialParentBbox = spatialParent.controlFlow.container.getBoundingClientRect()

            const vizBbox = (step.controlFlow.container.parentElement as HTMLElement).getBoundingClientRect()

            // const bbox = getPrincipleBbox(action)

            const x = spatialParentBbox.x + spatialParentBbox.width + offset.x - vizBbox.x
            const y = spatialParentBbox.y + offset.y

            const px = getNumericalValueOfStyle(step.controlFlow.container.style.left, x)
            const py = getNumericalValueOfStyle(step.controlFlow.container.style.top, y)

            step.controlFlow.container.style.left = `${overLerp(px, x, 0.2, 0.5)}px`
            step.controlFlow.container.style.top = `${overLerp(py, y, 0.2, 0.5)}px`
        }

        spatialIDs.push(step.id)

        // Consume offset if spatial
        offset.x = 0
        offset.y = 0
    }

    // Update children
    if (step.isShowingSteps) {
        spatialIDs.push(...updateFrameControlFlowChildrenPosition(stepId, offset))
    }

    return spatialIDs
}

export function updateFrameControlFlowChildrenPosition(stepId: string, offset: { x: number; y: number }) {
    const step = Steps.get(stepId)
    const frameIds: string[] = []

    step.subSteps.forEach((id) => {
        const vertex = Steps.get(id)
        frameIds.push(...updateFrameControlFlowPosition(vertex.id, offset))
    })

    return frameIds
}
