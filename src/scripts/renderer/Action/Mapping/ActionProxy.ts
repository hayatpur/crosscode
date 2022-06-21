import * as ESTree from 'estree'
import { Executor } from '../../../executor/Executor'
import { createEl } from '../../../utilities/dom'
import { Ticker } from '../../../utilities/Ticker'
import { Action } from '../Action'

export class ActionProxy {
    static all: { [id: string]: ActionProxy } = {}
    static stacks: { [location: string]: ActionProxy[] } = {}

    // Container of this things indicator and it's steps
    element: HTMLElement

    // Corresponding action
    action: Action

    // Sub-steps
    steps: { [stepId: string]: ActionProxy } = {}

    // Time in control flow
    timeOffset: number = 0

    static heightMultiplier = 0.8
    static widthMultiplier = 0.4

    private _tickerId: string

    private _isHovering: boolean = false

    constructor(action: Action) {
        this.action = action

        ActionProxy.all[action.state.id] = this
        ActionProxy.addToStack(this)

        this.create()
        this.update()

        this.element.addEventListener('click', (e) => {
            if (this.action.state.isShowingSteps) {
                this.action.destroySteps()
            } else {
                this.action.createSteps()
            }

            e.stopPropagation()
            e.preventDefault()
        })

        // Peek timer
        let peekTimer: number
        this.element.addEventListener('mouseenter', () => {
            clearTimeout(peekTimer)
            const delay = 1000

            peekTimer = setTimeout(() => {
                if (!this.action.state.isShowingSteps) {
                    this.hover()
                }
            }, delay)
        })

        this.element.addEventListener('mouseleave', () => {
            clearTimeout(peekTimer)
            this.unHover()
        })

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    hover() {
        if (this._isHovering) return
        this._isHovering = true

        this.element.classList.add('is-hovering')

        const mapping = Executor.instance.visualization.mapping
        mapping.cursor.isHovering = true

        mapping.time = this.timeOffset

        // Create children
        this.action.createSteps()
    }

    unHover() {
        if (!this._isHovering) return
        this._isHovering = false

        this.element.classList.remove('is-hovering')

        const mapping = Executor.instance.visualization.mapping
        mapping.cursor.isHovering = false

        // Destroy children
        this.action.destroySteps()
    }

    create() {
        const classes = [
            'action-proxy-container',
            `_${this.action.execution.nodeData.type?.replace(' ', '-')}`,
            `${this.action.execution.nodeData.preLabel?.replace(' ', '-')}`,
        ]

        this.element = createEl('div', classes)

        // Find stack
        let stack = ActionProxy.stacks[locationToKey(this.action.execution.nodeData.location)]
        const depth = stack.length - 1
        // this.element.style.transform = `translate(${depth * 2}px, ${depth * 2}px)`
    }

    tick(dt: number) {
        if (this._isHovering) {
            const mapping = Executor.instance.visualization.mapping

            if (mapping.cursor.isStatic) {
                mapping.time = this.timeOffset
            }
        }

        // Organize stacks
        for (const [key, stack] of Object.entries(ActionProxy.stacks)) {
            let isPlayingIndex = -1

            for (let i = 0; i < stack.length; i++) {
                const proxy = stack[i]
                if (proxy.element.classList.contains('is-playing')) {
                    isPlayingIndex = i
                    break
                }
            }

            if (isPlayingIndex == -1) {
                isPlayingIndex = 0
            }

            // Apply out-of-view
            for (let i = 0; i < stack.length; i++) {
                const proxy = stack[i]
                // if (i != isPlayingIndex) {
                //     proxy.element.classList.add('out-of-view')
                // } else {
                //     proxy.element.classList.remove('out-of-view')
                // }
                // proxy.element.style.transform = `translate(${i * 2}px, ${i * 2}px)`
            }
        }
    }

    update() {
        const hits: Set<string> = new Set()

        // Update classes
        this.action.steps.length > 0
            ? this.element.classList.add('has-steps')
            : this.element.classList.remove('has-steps')

        // Update steps
        for (const step of this.action.steps) {
            let proxy = this.steps[step.execution.id]

            if (proxy == null) {
                proxy = new ActionProxy(step)
                this.steps[step.execution.id] = proxy
                this.element.appendChild(proxy.element)
            }

            proxy.update()

            hits.add(step.execution.id)
        }

        // Remove unused
        for (const [stepId, proxy] of Object.entries(this.steps)) {
            if (!hits.has(stepId)) {
                proxy.element.remove()
                delete this.steps[stepId]
            }
        }

        // Update own visual
        this.action.representation.updateProxyVisual(this)

        /* ------------- Specialized representations ------------ */
        if (this.action.execution.nodeData.preLabel == 'Test') {
            if (!this.action.state.isShowingSteps) {
                const memory = Object.values(this.action.execution.postcondition.memory)
                const value = memory[memory.length - 1].value
                this.element.classList.add(`_Test_${value}`)
                const icon = value ? 'checkmark-outline' : 'close-outline'
                this.element.innerHTML = `<ion-icon name="${icon}"></ion-icon>`
            } else {
                // TODO
            }
        }
    }

    destroy() {
        delete ActionProxy.all[this.action.state.id]

        ActionProxy.removeFromStack(this)
        delete ActionProxy.stacks[locationToKey(this.action.execution.nodeData.location)]

        Ticker.instance.removeTickFrom(this._tickerId)

        this.element.remove()
        this.element = null
    }

    static addToStack(proxy: ActionProxy) {
        const key = locationToKey(proxy.action.execution.nodeData.location)
        if (ActionProxy.stacks[key] == null) {
            ActionProxy.stacks[key] = []
        }

        ActionProxy.stacks[key].push(proxy)
    }

    static removeFromStack(proxy: ActionProxy) {
        const key = locationToKey(proxy.action.execution.nodeData.location)
        const stack = ActionProxy.stacks[key]

        if (stack == null) {
            return
        }

        const index = stack.indexOf(proxy)
        if (index == -1) {
            return
        }

        stack.splice(index, 1)
    }
}

export function locationToKey(location: ESTree.SourceLocation) {
    return `${location.start.line}:${location.start.column}:${location.end.line}:${location.end.column}`
}
