import { catmullRomSolve } from '../../../utilities/math'
import { Action } from '../Action'
import { ActionMapping } from './ActionMapping'

/* ------------------------------------------------------ */
/*                      Control flow                      */
/* ------------------------------------------------------ */
export class ControlFlow {
    steps: Action[] = []

    container: SVGElement
    flowPath: SVGPathElement

    constructor(mapping: ActionMapping) {
        // Create container
        this.container = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.container.classList.add('control-flow-svg')
        mapping.element.appendChild(this.container)

        // Create path
        this.flowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.flowPath.classList.add('control-flow-path')

        this.update()
    }

    update() {
        // Get all control flow points
        const controlFlowPoints = [[0, 0]]

        for (let i = 0; i < this.steps.length; i++) {
            controlFlowPoints.push(...this.steps[i].proxy.getControlFlowPoints())
        }

        // controlFlowPoints.push([0, 0])

        // Create path
        const d = catmullRomSolve(controlFlowPoints.flat(), 0.5)
        this.flowPath.setAttribute('d', d)
    }
}
