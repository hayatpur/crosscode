import { Step, Steps } from '../Step'
import { postCreateStep } from './PostCreateStep'
import { updateControlFlowForStep } from './UpdateControlFlowForStep'

export function toggleSubSteps(stepId: string) {
    const step = Steps.get(stepId)

    if (step.isShowingSteps) {
        destroySubSteps(stepId)
    } else {
        createSubSteps(stepId)
    }
}

export function createSubSteps(stepId: string) {
    const step = Steps.get(stepId)

    if (!Step.isBreakable(stepId)) return

    if (step.isShowingSteps) {
        // TODO: Why don't we return?
        console.warn('Steps already created! Destroying existing.')
        destroySubSteps(stepId)
    }

    step.subSteps = []

    let steps = Step.getExecutionSteps(step.execution)

    // Create direct descendants
    for (let i = 0; i < steps.length; i++) {
        // Create step state
        const subStep = Step.createStepState(steps[i], step.id, step.parentFrameId)
        step.subSteps.push(subStep.id)
    }

    // Update state
    step.isShowingSteps = true

    updateControlFlowForStep(step.id)

    for (const stepId of step.subSteps) {
        postCreateStep(stepId)
    }
}

export function destroySubSteps(stepId: string) {
    const step = Steps.get(stepId)

    step.subSteps.forEach((id) => Step.destroyStep(id))
    step.subSteps = []

    step.isShowingSteps = false
}
