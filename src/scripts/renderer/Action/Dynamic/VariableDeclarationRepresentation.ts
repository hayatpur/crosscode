import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class VariableDeclarationRepresentation extends Representation {
    equalSignElement: HTMLElement

    constructor(action: ActionState) {
        super(action)

        this.equalSignElement = createElement('div', 'action-proxy-equal-sign')
        this.equalSignElement.innerText = '='

        this.shouldHover = true
        this.ignoreStepClicks = true
    }

    postCreate() {
        const action = ApplicationState.actions[this.actionId]

        if (action.execution.nodeData.preLabel == 'Statement') {
            this.createSteps()
        }
    }

    // getStartAndEndTime() {
    //     const action = ApplicationState.actions[this.actionId]

    //     if (action.isShowingSteps) {
    //         return ApplicationState.actions[action.vertices[0]].representation.getStartAndEndTime()
    //     } else {
    //         return super.getStartAndEndTime()
    //     }
    // }

    // getControlFlow(): number[][] {
    //     const action = ApplicationState.actions[this.actionId]

    //     if (action.isShowingSteps) {
    //         return ApplicationState.actions[action.vertices[0]].representation.getControlFlow()
    //     } else {
    //         return super.getControlFlow()
    //     }

    //     // const bbox = action.proxy.element.getBoundingClientRect()

    //     // if (action.vertices.length > 0) {
    //     //     const controlFlowPoints = []
    //     //     for (const stepID of action.vertices) {
    //     //         const step = ApplicationState.actions[stepID]
    //     //         controlFlowPoints.push(...step.representation.getControlFlow())
    //     //     }
    //     //     return controlFlowPoints
    //     // } else {
    //     //     return this.getControlFlowPoints()
    //     // }
    // }

    createSteps(): void {
        super.createSteps()

        // Add an '=' in between the two children if not already there
        const action = ApplicationState.actions[this.actionId]
        const proxy = action.proxy

        proxy.element.insertBefore(this.equalSignElement, proxy.element.children[1])
    }

    destroySteps(): void {
        super.destroySteps()
        this.equalSignElement.remove()
    }
}
