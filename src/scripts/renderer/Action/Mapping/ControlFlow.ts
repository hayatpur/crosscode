import { Executor } from '../../../executor/Executor'
import { catmullRomSolve } from '../../../utilities/math'
import { Ticker } from '../../../utilities/Ticker'
import { Action } from '../Action'
import { ActionMapping } from './ActionMapping'

/* ------------------------------------------------------ */
/*                      Control flow                      */
/* ------------------------------------------------------ */
export class ControlFlow {
    mapping: ActionMapping

    container: SVGElement
    flowPath: SVGPathElement

    private _tickerId: string

    dirty: boolean = true

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

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    tick(dt: number) {
        // if (!this.dirty) return

        this.update()

        // this.dirty = false
    }

    update() {
        // Get all control flow points
        const controlFlowPoints = [[26, 0]]

        const containerBbox = this.container.getBoundingClientRect()

        for (const step of getLeafSteps(this.mapping.action.steps)) {
            const points = step.proxy.getControlFlowPoints()
            points.forEach((point) => (point[0] -= containerBbox.left))
            points.forEach((point) => (point[1] -= containerBbox.top))

            controlFlowPoints.push(...points)
        }

        // controlFlowPoints.push([20, containerBbox.height])

        const d = catmullRomSolve(controlFlowPoints.flat(), Executor.instance.PARAMS.a)
        this.flowPath.setAttribute('d', d)

        // Update timings of step proxies
        const steps = getLeafSteps(this.mapping.action.steps)
        const pathBbox = this.flowPath.getBoundingClientRect()

        for (let t = 0; t < this.flowPath.getTotalLength(); t += 1) {
            const point = this.flowPath.getPointAtLength(t)
            point.x += pathBbox.left
            point.y += pathBbox.top

            const next = steps[0]
            if (next == null) return

            const nextIndicatorBBox = next.proxy.element.getBoundingClientRect()

            // const dx = Math.abs(nextIndicatorBBox.x - point.x + 30)
            const dy = Math.abs(nextIndicatorBBox.y - point.y)

            if (dy < 1) {
                steps.shift()
                next.proxy.timeOffset = t - 5
            }
        }
    }

    destroy() {
        Ticker.instance.removeTickFrom(this._tickerId)
        this.container.remove()
    }
}

export function getLeafSteps(steps: Action[]): Action[] {
    const result: Action[] = []

    for (const action of steps) {
        if (action.steps.length > 0) {
            result.push(...getLeafSteps(action.steps))
        } else {
            result.push(action)
        }
    }

    return result
}
