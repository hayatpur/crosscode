import { Executor } from '../../../executor/Executor'
import { getLeafSteps } from '../../../utilities/action'
import { createPathElement, createSVGElement } from '../../../utilities/dom'
import { bboxContains, catmullRomSolve } from '../../../utilities/math'
import { ActionMapping, getProxyOfAction } from './ActionMapping'

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

    dirty: boolean = true

    constructor(mapping: ActionMapping) {
        this.mapping = mapping

        // Containers
        this.container = createSVGElement('control-flow-svg', mapping.element)
        this.overlayContainer = createSVGElement(['control-flow-svg', 'control-flow-svg-overlay'], mapping.element)

        // Paths
        this.flowPath = createPathElement('control-flow-path', this.container)
        this.flowPathCompleted = createPathElement('control-flow-path-completed', this.container)
        this.flowPathOverlay = createPathElement('control-flow-path-overlay', this.overlayContainer)

        this.update()
    }

    update() {
        // Get all control flow points
        const controlFlowPoints = []
        const containerBbox = this.container.getBoundingClientRect()

        const points = Executor.instance.visualization.program.representation.getControlFlow()
        points.forEach((point) => (point[0] -= containerBbox.left))
        points.forEach((point) => (point[1] -= containerBbox.top))
        controlFlowPoints.push(...points)

        // End point
        // controlFlowPoints.push([10, this.mapping.element.getBoundingClientRect().bottom])

        // if (controlFlowPoints.length > 1) {
        //     // const sx = controlFlowPoints[1][0]
        //     // controlFlowPoints[0][0] = sx

        //     const ex = controlFlowPoints[controlFlowPoints.length - 2][0]
        //     controlFlowPoints[controlFlowPoints.length - 1][0] = ex
        // }

        // const t = performance.now()
        const d = catmullRomSolve(controlFlowPoints.flat(), 0)
        this.flowPath.setAttribute('d', d)

        // Update completed flow path
        this.flowPathCompleted.setAttribute('d', d)
        this.flowPathCompleted.style.strokeDasharray = `${this.flowPath.getTotalLength()}`
        this.flowPathCompleted.style.strokeDashoffset = `${this.flowPath.getTotalLength()}`

        // Update overlay flow path
        this.flowPathOverlay.setAttribute('d', d)

        // Update timings of step proxies
        const leafSteps = getLeafSteps(Executor.instance.visualization.program.steps)
        const pathBbox = this.container.getBoundingClientRect()

        for (let t = 0; t < this.flowPath.getTotalLength(); t += 1) {
            const point = this.flowPath.getPointAtLength(t)
            point.x += pathBbox.left
            point.y += pathBbox.top

            const next = leafSteps[0]
            if (next == null) break

            const proxy = getProxyOfAction(next)
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
    }

    destroy() {
        this.container.remove()
    }
}
