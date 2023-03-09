import { Steps } from '../Step'

export function maximizeStep(stepId: string) {
    const step = Steps.get(stepId)

    if (step.isShowingSteps) {
        step.subSteps.forEach((id) => {
            const subStep = Steps.get(id)

            if (!subStep.isFrame) {
                maximizeStep(id)
            }
        })
    }

    step.controlFlow.container.classList.remove('is-minimized')
    step.isMinimized = false

    if (step.isFrame) {
        const minimizeButton = step.controlFlow.header.children[1].children[0] as HTMLElement
        minimizeButton.innerText = '-'
    }
}

export function minimizeStep(stepId: string) {
    const step = Steps.get(stepId)

    if (step.isShowingSteps) {
        step.subSteps.forEach((id) => {
            const subStep = Steps.get(id)

            if (!subStep.isFrame) {
                minimizeStep(id)
            }
        })
    }

    step.controlFlow.container.classList.add('is-minimized')
    step.isMinimized = true

    if (step.isFrame) {
        const minimizeButton = step.controlFlow.header.children[1].children[0] as HTMLElement
        minimizeButton.innerText = '+'
    }
}
