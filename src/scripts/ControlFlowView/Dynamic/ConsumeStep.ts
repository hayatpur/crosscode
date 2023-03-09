import { Steps } from '../Step'
import { destroySubSteps } from './CreateSubSteps'

export function consumeStep(stepId: string) {
    const step = Steps.get(stepId)
    step.controlFlow.container.classList.add('consumed')

    if (step.isShowingSteps) {
        destroySubSteps(stepId)
    }
}

export function unConsumeStep(stepId: string) {
    const step = Steps.get(stepId)
    step.controlFlow.container.classList.remove('consumed')
}
