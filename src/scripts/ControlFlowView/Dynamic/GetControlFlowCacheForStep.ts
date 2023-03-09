import { Steps } from '../Step'
import { getControlFlowPointsForStep } from './GetControlFlowPointsForStep'

export function getControlFlowCacheForStep(stepId: string, originId: string) {
    const step = Steps.get(stepId)
    let cache = ''

    if (step.subSteps.length > 0) {
        if (step.isSelectableGroup) {
            let points = getControlFlowPointsForStep(step.id, false)
            cache += JSON.stringify(points)
        }

        for (const subStepId of step.subSteps) {
            const subStep = Steps.get(subStepId)
            cache += getControlFlowCacheForStep(subStep.id, originId)
        }
    } else {
        const points = getControlFlowPointsForStep(step.id)

        if (points != null) {
            cache += JSON.stringify(points)
        }
    }

    return cache
}
