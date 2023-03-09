import { Steps } from '../Step'
import { toggleSubSteps } from './CreateSubSteps'
import { focusStep } from './FocusStep'

export function clickedOnStep(e: MouseEvent, stepId: string): boolean {
    const step = Steps.get(stepId)

    if (e.ctrlKey || e.metaKey) {
        if (
            (step.isFrame && !(step.execution.nodeData.type == 'Program') && step.isShowingSteps) ||
            step.controlFlow.ignoreStepClicks
        ) {
            return false
        }

        toggleSubSteps(stepId)

        return true
    } else if (step.controlFlow.isHovering) {
        focusStep(stepId)
        return true
    }

    return false
}
