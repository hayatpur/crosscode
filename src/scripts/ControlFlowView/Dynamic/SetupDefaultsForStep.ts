import { Step, Steps } from '../Step'
import { createSubSteps } from './CreateSubSteps'

export function setupDefaultsForStep(stepId: string) {
    const step = Steps.get(stepId)

    step.isSkipped = Step.isSkippedByDefault(step.execution)

    // Dynamic stuff
    if (step.execution.nodeData.type == 'Program') {
        step.controlFlow.position.y = 200
        createSubSteps(stepId)
    }
}
