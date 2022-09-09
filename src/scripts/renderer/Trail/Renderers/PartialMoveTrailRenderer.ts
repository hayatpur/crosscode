import { ApplicationState } from '../../../ApplicationState'
import { EnvironmentState, Residual } from '../../../environment/EnvironmentState'
import { queryExecutionGraph } from '../../../execution/execution'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../../execution/primitive/ExecutionNode'
import { createElement, getPerfectArrow } from '../../../utilities/dom'
import { assert } from '../../../utilities/generic'
import { getTitleFromExecution } from '../../Action/Dynamic/Representation'
import { EnvironmentRenderer } from '../../View/Environment/EnvironmentRenderer'
import { Trail } from '../Trail'
import { TrailRenderer } from './TrailRenderer'

export class PartialMoveTrailRenderer extends TrailRenderer {
    trace: SVGPathElement

    // Trace indicator
    operationExecution: ExecutionGraph | ExecutionNode | null = null
    operationIndicator: { trace: HTMLElement; source: HTMLElement } | null = null

    /* ----------------------- Create ----------------------- */
    constructor(trail: Trail) {
        super(trail)

        // Create movement trace
        this.trace = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.trace.classList.add('action-mapping-connection', 'trail-move')

        const visualization = ApplicationState.visualization
        visualization.view!.svg.appendChild(this.trace)

        // OKAY I"M WORKING ON THIS, IT WILL GET DONE!
        const operation = this.trail.state.operations[0]
        if (operation == null) return

        this.operationIndicator = {
            trace: createElement('div', 'operation-indicator', document.body),
            source: createElement('div', 'operation-indicator-source', document.body),
        }

        this.operationIndicator.trace.classList.add('is-hidden')
        this.operationIndicator.source.classList.add('is-hidden')

        this.operationIndicator.trace.addEventListener('mouseover', () => {
            this.operationIndicator?.source.classList.add('is-hover')
        })

        this.operationIndicator.trace.addEventListener('mouseout', () => {
            this.operationIndicator?.source.classList.remove('is-hover')
        })

        // // Find execution node of that operation
        const programExecution = ApplicationState.actions[visualization.programId!].execution
        this.operationExecution = queryExecutionGraph(programExecution, (node) => node.id == operation.executionID)

        // Set title
        this.operationIndicator.trace.setAttribute('title', getTitleFromExecution(this.operationExecution))

        ApplicationState.traceIndicators.push(this.operationIndicator)
    }

    /* ----------------------- Animate ---------------------- */
    update(amount: number, environment: EnvironmentRenderer, totalTime: number) {
        assert(this.trail.state.fromDataIDs != undefined, 'fromDataIDs is undefined.')

        const start = environment.getResidualOf(this.trail.state.fromDataIDs[0], this.trail.time)
        const end = environment.getResidualOf(this.trail.state.toDataID, this.trail.time + 1)

        let shouldHideIndicator = false

        if (end == null || start == null) {
            this.trace.classList.add('hidden')
            shouldHideIndicator = true
            return
        } else {
            this.trace.classList.remove('hidden')
        }

        if (!start.element.isConnected || !end.element.isConnected) {
            this.trace.style.transition = ''
            this.trace.classList.add('hidden')
            shouldHideIndicator = true
            return
        } else {
            this.trace.classList.remove('hidden')
        }

        const visualization = ApplicationState.visualization
        const viewBbox = visualization.view!.element.getBoundingClientRect()
        const startBbox = start.element.getBoundingClientRect()
        const endBbox = end.element.getBoundingClientRect()

        const [d, ex, ey, endAngleAsDegrees] = getPerfectArrow(
            startBbox.x + startBbox.width / 2 - viewBbox.x,
            startBbox.y + startBbox.height / 2 - viewBbox.y,
            endBbox.x + endBbox.width / 2 - viewBbox.x,
            endBbox.y + endBbox.height / 2 - viewBbox.y
        )

        this.trace.setAttribute('d', d)

        this.trace.style.strokeDasharray = `${this.trace.getTotalLength()}`
        this.trace.style.strokeDashoffset = `${this.trace.getTotalLength() - amount * this.trace.getTotalLength()}`

        if (this.trace.style.transition == '') {
            setTimeout(() => {
                this.trace.style.transition = '0.2s'
            }, 0)
        }

        const traceContainerBbox = this.trace.parentElement!.getBoundingClientRect()

        // Update position of operation indicator
        if (this.operationIndicator != null) {
            if (this.operationExecution != null) {
                // Trace position
                const { x: x2, y: y2 } = this.trace.getPointAtLength((amount * this.trace.getTotalLength()) / 2)

                this.operationIndicator.trace.style.left = `${x2 + traceContainerBbox.x - 2.5}px`
                this.operationIndicator.trace.style.top = `${y2 + traceContainerBbox.y - 2.5}px`

                // Source position
                let sourceBbox = ApplicationState.editor.computeBoundingBoxForLoc(
                    this.operationExecution.nodeData.location!
                )
                this.operationIndicator.source.style.left = `${sourceBbox.x}px`
                this.operationIndicator.source.style.top = `${sourceBbox.y}px`
                this.operationIndicator.source.style.width = `${sourceBbox.width}px`
                this.operationIndicator.source.style.height = `${sourceBbox.height}px`
            } else {
                shouldHideIndicator = true
            }
        }

        const fadeout = Math.exp(-0.1 * Math.abs(totalTime - this.trail.time) ** 6)
        this.trace.style.opacity = `${Math.max(0.4, fadeout)}`
        this.trace.style.strokeWidth = `${Math.max(0.4, fadeout) * 3}`

        if (fadeout < 0.4) {
            this.trace.classList.add('is-expired')
            shouldHideIndicator = true
        } else {
            this.trace.classList.remove('is-expired')
        }

        if (amount == 0) {
            shouldHideIndicator = true
        }

        if (shouldHideIndicator) {
            this.operationIndicator?.trace.classList.add('is-hidden')
            this.operationIndicator?.source.classList.add('is-hidden')
        } else {
            this.operationIndicator?.trace.classList.remove('is-hidden')
            this.operationIndicator?.source.classList.remove('is-hidden')
        }
    }

    postUpdate(amount: number, environment: EnvironmentRenderer, totalTime: number) {
        assert(this.trail.state.fromDataIDs != undefined, 'fromDataIDs is undefined.')

        if (amount == 1) {
            const start = environment.getResidualOf(this.trail.state.fromDataIDs[0], this.trail.time)
            const end = environment.getResidualOf(this.trail.state.toDataID, this.trail.time + 1)

            // TODO: Residuals should use different colorings
            // this.trace.style.opacity = `${Math.min(
            //     getNumericalValueOfStyle(end.element.style.opacity, 1),
            //     getNumericalValueOfStyle(start.element.style.opacity, 1)
            // )}`
        }

        // Update path
        if (amount == 0) {
            this.trace.classList.add('hidden')
        }
    }

    /**
     * @param environment Prev environment
     * @returns
     */
    computeResidual(environment: EnvironmentState): Residual | null {
        return null
    }

    applyTimestamps(environment: EnvironmentState) {}

    /* ----------------------- Destroy ---------------------- */
    destroy() {
        super.destroy()
        this.trace.remove()

        if (this.operationIndicator != null) {
            ApplicationState.traceIndicators.splice(
                ApplicationState.traceIndicators.indexOf(this.operationIndicator),
                1
            )
            this.operationIndicator?.source.remove()
            this.operationIndicator?.trace.remove()
        }
    }
}
