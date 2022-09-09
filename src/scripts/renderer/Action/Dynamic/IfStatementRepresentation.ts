import * as monaco from 'monaco-editor'
import { ApplicationState } from '../../../ApplicationState'
import { createElement } from '../../../utilities/dom'
import { ActionState } from '../Action'
import { Representation } from './Representation'

export class IfStatementRepresentation extends Representation {
    ifLabelElement: HTMLElement
    elseLabelElement: HTMLElement

    rows: HTMLElement[]

    constructor(action: ActionState) {
        super(action)

        this.ifLabelElement = createElement('div', ['action-proxy-code-label', 'action-proxy-if-label'])
        this.ifLabelElement.innerText = 'if'
        monaco.editor.colorize(this.ifLabelElement.innerHTML, 'javascript', {}).then((html) => {
            this.ifLabelElement.innerHTML = html
            action.proxy.container.classList.add('is-if-statement')
            action.proxy.header.after(this.ifLabelElement)
        })

        this.elseLabelElement = createElement('div', ['action-proxy-code-label', 'action-proxy-else-label'])
        this.elseLabelElement.innerText = 'else'
        monaco.editor.colorize(this.elseLabelElement.innerHTML, 'javascript', {}).then((html) => {
            this.elseLabelElement.innerHTML = html
        })

        this.rows = []

        this.shouldHover = true
    }

    postCreate() {
        const action = ApplicationState.actions[this.actionId]

        const parent = ApplicationState.actions[action.parentID as string]
        // console.log(
        //     parent.execution.nodeData.type,
        //     parent.execution.nodeData.preLabel,
        //     parent.execution.nodeData.type == 'BlockStatement' && parent.execution.nodeData.preLabel == 'Body'
        // )
        // if (parent.execution.nodeData.type == 'BlockStatement' && parent.execution.nodeData.preLabel == 'Body') {
        // } else {
        // this.createSteps()
        // }
    }

    updateProxyVisual() {
        super.updateProxyVisual()
    }

    createSteps(): void {
        super.createSteps()

        const action = ApplicationState.actions[this.actionId]
        const proxy = action.proxy

        const children = Array.from(proxy.element.children).filter((child) =>
            child.classList.contains('action-proxy-container')
        )

        // Remove all action-proxy children
        for (const child of children) {
            child.remove()
        }

        // Create four rows
        const rows: HTMLElement[] = []
        for (let i = 0; i < 4; i++) {
            rows.push(createElement('div', 'action-proxy-if-row', proxy.element))
        }

        // Add the if label
        // rows[0].append(this.ifLabelElement)

        // Append the binary expression to the top
        rows[0].append(children[0])

        // This if statement was unsuccessful and an else was reached
        if (
            action.vertices.length == 2 &&
            ApplicationState.actions[action.vertices[1]].execution.nodeData.preLabel == 'Alternate'
        ) {
            // Add the else label
            rows[1].append(createElement('div', 'action-proxy-if-placeholder'))
            rows[2].append(this.elseLabelElement)
            rows[3].append(children[1])
        }

        // This if statement was successful
        if (
            action.vertices.length == 2 &&
            ApplicationState.actions[action.vertices[1]].execution.nodeData.preLabel == 'Consequent'
        ) {
            rows[1].append(children[1])

            rows[2].remove()
            rows[3].remove()
        }

        this.shouldHover = false

        this.rows = rows
    }

    setupHoverListener() {
        const action = ApplicationState.actions[this.actionId]

        // Hovers on container instead of element.
        action.proxy.container.addEventListener('mouseenter', (e) => {
            const action = ApplicationState.actions[this.actionId]

            if (action.representation.shouldHover) {
                action.proxy.isHovering = true
                action.proxy.container.classList.add('is-hovering')
            }

            e.preventDefault()
            e.stopPropagation()
        })

        action.proxy.container.addEventListener('mouseleave', (e) => {
            const action = ApplicationState.actions[this.actionId]

            if (action.proxy.isHovering) {
                action.proxy.isHovering = false
                action.proxy.container.classList.remove('is-hovering')
            }

            e.preventDefault()
            e.stopPropagation()
        })
    }

    setupClickListener() {
        const action = ApplicationState.actions[this.actionId]

        action.proxy.container.addEventListener('click', (e) => {
            let success = this.clicked(e)

            if (success) {
                e.preventDefault()
                e.stopPropagation()
            }
        })
    }

    select() {
        super.select()

        const action = ApplicationState.actions[this.actionId]
        action.proxy.container.classList.add('is-focused')
    }

    deselect() {
        super.deselect()

        const action = ApplicationState.actions[this.actionId]
        action.proxy.container.classList.remove('is-focused')
    }

    destroySteps(): void {
        super.destroySteps()

        // this.ifLabelElement.remove()
        this.elseLabelElement?.remove()

        this.shouldHover = true

        this.rows.forEach((row) => row.remove())
        this.rows = []
    }
}
