import { assert } from '../../utilities/generic'
import { getTotalDuration } from '../ControlFlowCursor'
import { Steps } from '../Step'
import { TimeMarkers } from '../TimeMarker'

export function focusStep(stepId: string) {
    const step = Steps.get(stepId)

    const frameId = step.parentFrameId
    assert(frameId != null, 'Spatial parent ID is null')

    const frame = Steps.get(frameId)

    const controlFlow = frame.controlFlow.path
    assert(controlFlow != null, 'Control flow is null')

    // Move time marker to end of step
    const timeMarker = TimeMarkers.get(controlFlow.cursor.timeMarkerId)
    timeMarker.targetGlobalTime = step.globalTimeOffset + getTotalDuration(step.id)
}
