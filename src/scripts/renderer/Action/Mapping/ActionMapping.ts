import { Executor } from '../../../executor/Executor'
import { getAllSteps } from '../../../utilities/action'
import { createEl } from '../../../utilities/dom'
import { Keyboard } from '../../../utilities/Keyboard'
import { catmullRomSolve, lerp } from '../../../utilities/math'
import { Ticker } from '../../../utilities/Ticker'
import { Action } from '../Action'

export class ActionMapping {
    element: HTMLElement
    action: Action

    isHidden: boolean

    // Source code proxies
    sourceCodeProxies: { [id: string]: HTMLElement } = {}

    // View proxies
    viewProxies: { [id: string]: HTMLElement } = {}

    // Each view has keyframes
    viewKeyframeProxies: { [id: string]: HTMLElement } = {}

    connectionsContainer: SVGElement
    connections: { [id: string]: SVGPathElement } = {}

    // Time cursor
    cursor: HTMLElement
    cursorSelected: boolean = false
    time: number = 0

    _tickerId: string

    constructor(action: Action) {
        this.action = action
        this.create()

        this.hide()
        this.element.addEventListener('click', () => {
            if (this.isHidden) {
                this.show()
            } else {
                this.hide()
            }
        })

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))

        this.cursor.addEventListener('click', (e) => {
            this.cursorSelected = !this.cursorSelected
            if (this.cursorSelected) {
                this.cursor.classList.add('selected')
            } else {
                this.cursor.classList.remove('selected')
            }

            e.preventDefault()
            e.stopPropagation()
        })
    }

    create() {
        this.element = createEl('div', 'action-mapping', this.action.renderer.mappingContainer)

        this.connectionsContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.element.appendChild(this.connectionsContainer)
        this.connectionsContainer.classList.add('action-mapping-connections-container')

        this.cursor = createEl('div', 'action-mapping-cursor', this.element)
    }

    render() {
        this.renderStepProxies()
        this.renderViewProxies()
        // this.renderViewKeyframeProxies()
    }

    tick(dt: number) {
        this.renderConnections()

        const multiplier = 0.001
        if (Keyboard.instance.isPressed('ArrowUp') && this.cursorSelected) {
            this.updateTime(this.time - dt * multiplier)
        } else if (Keyboard.instance.isPressed('ArrowDown') && this.cursorSelected) {
            this.updateTime(this.time + dt * multiplier)
        }

        this.cursor.style.top = `${this.time * 100}%`
    }

    updateTime(time: number) {
        this.time = time
        this.time = Math.max(0, Math.min(this.time, 1))
        this.action.views.forEach((view) => {
            view.controller.updateTime(time)
        })
    }

    renderConnections() {
        const hits = new Set()

        for (const view of this.action.views) {
            for (let i = 0; i < view.executions.length; i++) {
                const execution = view.executions[i]
                const t = view.controller.getTime(i)

                // Found a match
                const id = `${execution.id}_${view.state.id}`
                let connection = this.connections[id]

                const stepProxy = this.sourceCodeProxies[execution.id]
                const viewProxy = this.renderViewProxies[view.state.id]

                if (stepProxy == null || viewProxy == null) {
                    continue
                }

                if (connection == null) {
                    connection = document.createElementNS('http://www.w3.org/2000/svg', 'path')
                    connection.classList.add('action-mapping-connection')
                    this.connectionsContainer.appendChild(connection)
                    this.connections[id] = connection
                }

                const containerBbox = this.connectionsContainer.getBoundingClientRect()
                const stepBbox = stepProxy.getBoundingClientRect()
                const viewBbox = viewProxy.getBoundingClientRect()

                const x1 = stepBbox.x + stepBbox.width / 2 - containerBbox.x
                const y1 = stepBbox.y + stepBbox.height / 2 - containerBbox.y

                const x2 = viewBbox.x + viewBbox.width / 2 - containerBbox.x
                const y2 = lerp(viewBbox.y, viewBbox.y + viewBbox.height, t) - containerBbox.y

                // connection.setAttribute('d', `M ${x1} ${y1} ${x2} ${y2}`)
                connection.setAttribute(
                    'd',
                    catmullRomSolve([x1, y1, (x1 + x2) / 2, y2, x2, y2], Executor.instance.PARAMS.a)
                )

                hits.add(id)
            }
        }

        // Destroy left over connections
        for (const id of Object.keys(this.connections)) {
            if (!hits.has(id)) {
                this.connections[id].remove()
                delete this.connections[id]
            }
        }
    }
    // renderViewKeyframeProxies() {
    //     const hits: Set<string> = new Set()

    //     // Find keyframes
    //     let viewKeyFrames: { [viewId: string]: { viewId: string; time: number }[] } = {}
    //     for (const step of getAllSteps(this.action)) {
    //         if (step instanceof ActionBundle) continue

    //         // Get the view that the step maps to
    //         const viewId = this.action.stepToViewMappings[step.execution.id]
    //         if (viewKeyFrames[viewId] == null) {
    //             viewKeyFrames[viewId] = []
    //         }

    //         // Add the keyframe
    //         viewKeyFrames[viewId].push({ viewId, time: step.execution.time })
    //     }

    //     // Destroy frames
    //     // for (const id in this.sourceCodeProxies) {
    //     //     if (!hits.has(id)) {
    //     //         this.sourceCodeProxies[id].remove()
    //     //         delete this.sourceCodeProxies[id]
    //     //     }
    //     // }
    // }

    renderStepProxies() {
        const hits: Set<string> = new Set()

        const allSteps = getAllSteps(this.action)

        for (const view of this.action.views) {
            for (const execution of view.executions) {
                const step = allSteps.find(
                    (step) => step instanceof Action && step.execution.id === execution.id
                ) as Action

                let proxy = this.sourceCodeProxies[step.execution.id]

                if (proxy == null) {
                    proxy = createEl('div', 'action-mapping-step', this.element)
                    this.sourceCodeProxies[step.execution.id] = proxy
                }

                // Align it with the step
                const headerBbox = step.renderer.header.getBoundingClientRect()
                const parentBbox = this.action.renderer.element.getBoundingClientRect()
                proxy.style.top = `${headerBbox.y - parentBbox.y}px`

                hits.add(step.execution.id)
            }
        }

        // Destroy steps
        for (const id in this.sourceCodeProxies) {
            if (!hits.has(id)) {
                this.sourceCodeProxies[id].remove()
                delete this.sourceCodeProxies[id]
            }
        }
    }

    renderViewProxies() {
        const hits: Set<string> = new Set()

        for (const view of this.action.views) {
            let proxy = this.renderViewProxies[view.state.id]

            if (proxy == null) {
                proxy = createEl('div', 'action-mapping-view', this.element)
                this.renderViewProxies[view.state.id] = proxy
            }

            // Align it with the view
            const viewBbox = view.renderer.element.getBoundingClientRect()
            const parentBbox = this.action.renderer.element.getBoundingClientRect()
            proxy.style.top = `${viewBbox.y - parentBbox.y}px`
            proxy.style.height = `${viewBbox.height}px`

            hits.add(view.state.id)
        }

        // Destroy views
        for (const id in this.renderViewProxies) {
            if (!hits.has(id)) {
                this.renderViewProxies[id].remove()
                delete this.renderViewProxies[id]
            }
        }
    }

    hide() {
        this.isHidden = true
        this.element.classList.add('hidden')
        this.element.parentElement.classList.add('hidden')
    }

    show() {
        this.isHidden = false
        this.element.classList.remove('hidden')
        this.element.parentElement.classList.remove('hidden')
        this.render()
    }

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        this.element.remove()

        Ticker.instance.removeTickFrom(this._tickerId)

        this.element = null
        this.action = null
    }
}
