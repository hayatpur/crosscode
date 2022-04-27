import { Executor } from '../../../executor/Executor'
import { catmullRomSolve } from '../../../utilities/math'
import { ActionMapping } from './ActionMapping'

/* ------------------------------------------------------ */
/*                      Control flow                      */
/* ------------------------------------------------------ */
export class ControlFlow {
    mapping: ActionMapping

    container: SVGElement
    flowPath: SVGPathElement

    constructor(mapping: ActionMapping) {
        this.mapping = mapping

        // Create container
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.container.classList.add('control-flow-svg')
        mapping.element.appendChild(this.container)

        // Create path
        this.flowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.flowPath.classList.add('control-flow-path')

        this.container.appendChild(this.flowPath)

        this.update()
    }

    update() {
        // Get all control flow points
        const controlFlowPoints = [[20, 0]]

        const containerBbox = this.container.getBoundingClientRect()

        for (const step of this.mapping.action.steps) {
            const points = step.proxy.getControlFlowPoints()
            // points.forEach((point) => (point[0] -= containerBbox.left))
            points.forEach((point) => (point[1] -= containerBbox.top))

            controlFlowPoints.push(...points)
        }

        controlFlowPoints.push([20, containerBbox.height])

        // for (let i = 0; i < this.mapping.ste.length; i++) {
        //     console.log('OK')
        //     controlFlowPoints.push(...this.steps[i].proxy.getControlFlowPoints())
        // }

        // controlFlowPoints.push([0, 0])

        // Create path

        const d = catmullRomSolve(controlFlowPoints.flat(), Executor.instance.PARAMS.a)
        this.flowPath.setAttribute('d', d)
    }
}
