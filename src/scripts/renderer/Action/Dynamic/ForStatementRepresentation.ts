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
        this.stackButton.innerHTML = `<ion-icon name="expand"></ion-icon>`

        // Add stack button to proxy
        setTimeout(() => {
            const proxy = Executor.instance.visualization.mapping.getProxyOfAction(action)
            proxy.element.appendChild(this.stackButton)
        }, 0)

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
}
