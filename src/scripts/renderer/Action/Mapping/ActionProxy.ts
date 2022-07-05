import * as ESTree from 'estree'
import { EnvironmentState } from '../../../environment/EnvironmentState'
import { Executor } from '../../../executor/Executor'
import { createElement } from '../../../utilities/dom'
import { Ticker } from '../../../utilities/Ticker'
import { Action, createSteps, destroySteps } from '../Action'

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

    static heightMultiplier = 1
    static widthMultiplier = 0.4

    private _tickerId: string

    private _isHovering: boolean = false

    constructor(action: Action) {
        this.action = action

        ActionProxy.all[action.state.id] = this
        ActionProxy.addToStack(this)

        const classes = [
            'action-proxy-container',
            `_${this.action.execution.nodeData.type?.replace(' ', '-')}`,
            `${this.action.execution.nodeData.preLabel?.replace(' ', '-')}`,
        ]

        this.element = createElement('div', classes)

        // Find stack
        // let stack = ActionProxy.stacks[locationToKey(this.action.execution.nodeData.location as ESTree.SourceLocation)]
        // const depth = stack.length - 1

        this.update()

        this.element.addEventListener('click', (e) => {
            if (this.action.state.isShowingSteps && !this._isHovering) {
                destroySteps(this.action)
            } else {
                if (this._isHovering) {
                    this.unHover()
                }

                createSteps(this.action)
            }

            e.stopPropagation()
            e.preventDefault()
        })

        // Hover
        this.element.addEventListener('mouseenter', () => {
            // if (Keyboard.instance.isPressed('Control')) {
            //     // Parent is hovering, so navigate in control flow to this statement
            //     const mapping = Executor.instance.visualization.mapping
            //     mapping.cursor.targetTime = this.timeOffset
            //     mapping.cursor.updatedTargetTime = true
            // }
            // const parentProxy = this.action.parent ? getProxyOfAction(this.action.parent) : null
            // if (
            //     !this._isHovering &&
            //     !this.action.state.isShowingSteps &&
            //     !Executor.instance.visualization.mapping.cursor.dragging
            // ) {
            //     // if (parentProxy == null || !parentProxy._isHovering) {
            //     //     this.hover()
            //     // } else {
            //     // Parent is hovering, so navigate in control flow to this statement
            //     const mapping = Executor.instance.visualization.mapping
            //     mapping.cursor.targetTime = this.timeOffset
            //     mapping.cursor.updatedTargetTime = true
            // }
        })

        this.element.addEventListener('mouseleave', () => {
            this.unHover()
        })

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    hover() {
        if (this._isHovering) return
        this._isHovering = true

        this.element.classList.add('is-hovering')
        Executor.instance.visualization.mapping.cursor.element.classList.add('proxy-is-hovering')

        // Create children
        createSteps(this.action)
    }

    unHover(override = true) {
        if (!this._isHovering) return
        this._isHovering = false

        this.element.classList.remove('is-hovering')
        Executor.instance.visualization.mapping.cursor.element.classList.remove('proxy-is-hovering')

        // If any of the children were expanded, then don't destroy steps
        let shouldDestroySteps = override

        for (const [, proxy] of Object.entries(this.steps)) {
            if (proxy.action.state.isShowingSteps) {
                shouldDestroySteps = false
                break
            }
        }

        // Destroy children
        if (shouldDestroySteps) {
            destroySteps(this.action)
        }
    }

    peak() {
        const mapping = Executor.instance.visualization.mapping
        mapping.cursor.isHovering = true

        mapping.time = this.timeOffset

        // Create children
        createSteps(this.action)
    }

    unPeak() {
        const mapping = Executor.instance.visualization.mapping
        mapping.cursor.isHovering = false

        // Destroy children
        destroySteps(this.action)
    }

    tick(dt: number) {
        // if (this._isHovering) {
        //     const mapping = Executor.instance.visualization.mapping

        //     if (mapping.cursor.isStatic) {
        //         mapping.time = this.timeOffset
        //     }
        // }

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
            // for (let i = 0; i < stack.length; i++) {
            //     const proxy = stack[i]
            //     if (i != isPlayingIndex) {
            //         proxy.element.classList.add('out-of-view')
            //     } else {
            //         proxy.element.classList.remove('out-of-view')
            //     }
            //     // proxy.element.style.transform = `translate(${i * 2}px, ${i * 2}px)`
            // }
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

                if (proxy.action.execution.nodeData.type == 'FunctionCall') {
                    const mapping = Executor.instance.visualization.mapping
                    // const execution = proxy.action.execution.nodeData.preLabel
                    mapping.createLane(`${proxy.action.execution.nodeData.preLabel}`)
                    mapping.addElement(proxy.element)
                } else {
                    this.element.appendChild(proxy.element)
                }
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
                const memory = Object.values((this.action.execution.postcondition as EnvironmentState).memory)
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
        delete ActionProxy.stacks[locationToKey(this.action.execution.nodeData.location as ESTree.SourceLocation)]

        Ticker.instance.removeTickFrom(this._tickerId)

        this.element?.remove()
        // this.element = null
    }

    static addToStack(proxy: ActionProxy) {
        const key = locationToKey(proxy.action.execution.nodeData.location as ESTree.SourceLocation)
        if (ActionProxy.stacks[key] == null) {
            ActionProxy.stacks[key] = []
        }

        ActionProxy.stacks[key].push(proxy)
    }

    static removeFromStack(proxy: ActionProxy) {
        const key = locationToKey(proxy.action.execution.nodeData.location as ESTree.SourceLocation)
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
