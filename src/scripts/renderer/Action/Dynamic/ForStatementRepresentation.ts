import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class ForStatementRepresentation extends Representation {
    forLabelElement: HTMLElement

    constructor(action: ActionState) {
        super(action)

        this.forLabelElement = createElement('div', ['action-proxy-code-label', 'action-proxy-for-label'])
        this.forLabelElement.innerText = 'for'
        monaco.editor.colorize(this.forLabelElement.innerHTML, 'javascript', {}).then((html) => {
            this.forLabelElement.innerHTML = html
        })
    }

    updateProxyVisual() {
        super.updateProxyVisual()

        const action = ApplicationState.actions[this.actionId]
        const proxy = action.proxy

        if (!action.isShowingSteps) return

        // TODO: this check actually doesn't work
        if (this.forLabelElement.parentElement != proxy.element) {
            const children = Array.from(proxy.element.children).filter((child) =>
                child.classList.contains('action-proxy-container')
            )

            // Remove all action-proxy children
            for (const child of children) {
                child.remove()
            }

            // Add the for label
            proxy.element.appendChild(this.forLabelElement)

            const iterations = (children.length - 2) / 3
            const iterationElements = []
            iterationElements.push(createLoopIterationElement())

            // Add initial declaration
            iterationElements[0].children[0].append(children[0])

            const startClone = children[0].cloneNode(true) as HTMLElement
            startClone.classList.add('action-proxy-for-start-clone')

            for (let i = 0; i < iterations; i++) {
                // if (i != 0) {
                //     iterationElements[i].children[0].append(
                //         this.forLabelElement.cloneNode(true)
                //     )
                // }

                if (i != 0) {
                    iterationElements[i].children[0].append(startClone.cloneNode(true))
                }

                iterationElements[i].children[0].append(children[i * 3 + 1]) // Check
                iterationElements[i].children[1].append(children[i * 3 + 2]) // Body
                iterationElements[i].children[0].append(children[i * 3 + 3]) // Update

                iterationElements.push(createLoopIterationElement())
            }

            // Add final check (failed)
            iterationElements[iterations].children[0].append(children[children.length - 1])

            // Add iteration elements to proxy
            for (const iterationElement of iterationElements) {
                proxy.element.append(iterationElement)
            }
        }

        // let width = 0
        // let height = 0

        // for (const childId of action.vertices) {
        //     const child = ApplicationState.actions[childId]

        //     const bbox = getActionCoordinates(
        //         child.execution,
        //         ApplicationState.actions[action.id].execution
        //     )

        //     // Scale by the proxy scale
        //     // let height = bbox.height * ApplicationState.proxyHeightMultiplier
        //     // let width = bbox.width * ApplicationState.proxyWidthMultiplier
        //     // width = Math.max(10, width)

        //     let x = bbox.x * ApplicationState.proxyWidthMultiplier
        //     let y = bbox.y * ApplicationState.proxyHeightMultiplier

        //     child.proxy.element.style.left = `${x}px`
        //     child.proxy.element.style.top = `${y}px`

        //     const childActualBbox = child.proxy.element.getBoundingClientRect()

        //     width = Math.max(width, x + childActualBbox.width)
        //     height = Math.max(height, y + childActualBbox.height)
        // }

        // proxy.element.style.height = `${height}px`
        // proxy.element.style.width = `${width}px`
    }
}

function createLoopIterationElement() {
    const el = createElement('div', 'action-proxy-for-iteration')
    el.innerHTML = `<div class="action-proxy-for-iteration-top"></div> <div class="action-proxy-for-iteration-bottom"></div>`

    return el
}
