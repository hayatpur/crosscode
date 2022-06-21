import { Executor } from '../../../executor/Executor'
import { Action } from '../Action'
import { Representation } from './Representation'

export class ForStatementRepresentation extends Representation {
    stackButton: HTMLElement
    isShowingStack: boolean = false

    constructor(action: Action) {
        super(action)

        this.stackButton = document.createElement('div')
        this.stackButton.classList.add('stack-button')
        this.stackButton.innerHTML = `V`

        // Add stack button to proxy
        // setTimeout(() => {
        //     const proxy = Executor.instance.visualization.mapping.getProxyOfAction(action)
        //     proxy.element.appendChild(this.stackButton)
        // }, 0)

        this.stackButton.addEventListener('click', (e) => {
            this.isShowingStack = !this.isShowingStack

            if (this.isShowingStack) {
                this.stackButton.classList.add('is-active')
            } else {
                this.stackButton.classList.remove('is-active')
            }

            this.updateStack()

            e.preventDefault()
            e.stopPropagation()
        })
    }

    updateStack() {
        const proxy = Executor.instance.visualization.mapping.getProxyOfAction(this.action)

        if (this.isShowingStack) {
            proxy.element.classList.add('showing-stack')
        } else {
            proxy.element.classList.remove('showing-stack')
        }

        Executor.instance.visualization.program.update()
    }

    getControlFlow() {
        if (this.action.steps.length == 0) {
            return super.getControlFlow()
        } else {
            // const controlFlowPoints = []

            const proxy = Executor.instance.visualization.mapping.getProxyOfAction(this.action)
            const bbox = proxy.element.getBoundingClientRect()
            const controlFlowPoints = [[bbox.x + 10, bbox.y + bbox.height / 2]]

            for (const step of this.action.steps) {
                controlFlowPoints.push(...step.representation.getControlFlow())
            }
            return controlFlowPoints
        }
    }
}
