import { Executor } from '../../../executor/Executor'
import { getLeafSteps } from '../../../utilities/action'
import { bboxContains, catmullRomSolve } from '../../../utilities/math'
import { Ticker } from '../../../utilities/Ticker'
import { ActionMapping } from './ActionMapping'

/* ------------------------------------------------------ */
/*                      Control flow                      */
/* ------------------------------------------------------ */
export class ControlFlow {
    mapping: ActionMapping

    container: SVGElement
    overlayContainer: SVGElement

    flowPath: SVGPathElement
    flowPathCompleted: SVGPathElement
    flowPathOverlay: SVGPathElement

    private _tickerId: string

    dirty: boolean = true

    constructor(mapping: ActionMapping) {
        this.mapping = mapping

        // Create container
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.container.classList.add('control-flow-svg')
        mapping.element.appendChild(this.container)

        // Create overlay container
        this.overlayContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.overlayContainer.classList.add('control-flow-svg', 'control-flow-svg-overlay')
        mapping.element.appendChild(this.overlayContainer)

        // Create path
        this.flowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.flowPath.classList.add('control-flow-path')
        this.container.appendChild(this.flowPath)

        // Create completed path
        this.flowPathCompleted = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.flowPathCompleted.classList.add('control-flow-path-completed')
        this.overlayContainer.appendChild(this.flowPathCompleted)

        // Create overlay path
        this.flowPathOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.flowPathOverlay.classList.add('control-flow-path-overlay')
        this.overlayContainer.appendChild(this.flowPathOverlay)

        this.update()
    }

    update() {
        // Get all control flow points
        const controlFlowPoints = [[10, 0]]
        const containerBbox = this.container.getBoundingClientRect()
        const steps = Executor.instance.visualization.program.steps

        for (const step of getLeafSteps(steps)) {
            const points = Executor.instance.visualization.mapping
                .getProxyOfAction(step)
                .getControlFlowPoints()

            points.forEach((point) => (point[0] -= containerBbox.left))
            points.forEach((point) => (point[1] -= containerBbox.top))
            controlFlowPoints.push(...points)
        }

        // End point
        controlFlowPoints.push([10, this.mapping.element.getBoundingClientRect().bottom])

        if (controlFlowPoints.length > 2) {
            const sx = controlFlowPoints[1][0]
            controlFlowPoints[0][0] = sx

            const ex = controlFlowPoints[controlFlowPoints.length - 2][0]
            controlFlowPoints[controlFlowPoints.length - 1][0] = ex
        }

        const t = performance.now()
        const d = catmullRomSolve(controlFlowPoints.flat(), 0.5)
        this.flowPath.setAttribute('d', d)

        // Update completed flow path
        this.flowPathCompleted.setAttribute('d', d)
        this.flowPathCompleted.style.strokeDasharray = `${this.flowPath.getTotalLength()}`
        this.flowPathCompleted.style.strokeDashoffset = `${this.flowPath.getTotalLength()}`

        // Update overlay flow path
        this.flowPathOverlay.setAttribute('d', d)

        // Update timings of step proxies
        const leafSteps = getLeafSteps(steps)
        const pathBbox = this.flowPath.parentElement.getBoundingClientRect()

        for (let t = 0; t < this.flowPath.getTotalLength(); t += 1) {
            const point = this.flowPath.getPointAtLength(t)
            point.x += pathBbox.left
            point.y += pathBbox.top

            const next = leafSteps[0]
            if (next == null) break

            const proxy = Executor.instance.visualization.mapping.getProxyOfAction(next)
            const nextIndicatorBBox = proxy.element.getBoundingClientRect()

            if (
                bboxContains(nextIndicatorBBox, {
                    x: point.x,
                    y: point.y,
                    width: 1,
                    height: 1,
                })
            ) {
                leafSteps.shift()
                proxy.timeOffset = t
            }
        }

        console.log(
            `Catmull-Rom solve time: ${performance.now() - t}ms`,
            this.flowPath.getTotalLength()
        )
    }

    destroy() {
        Ticker.instance.removeTickFrom(this._tickerId)
        this.container.remove()
    }
}
