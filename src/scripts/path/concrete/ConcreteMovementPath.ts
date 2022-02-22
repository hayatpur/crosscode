import { getArrow } from 'curved-arrows'
import { DataRenderer } from '../../environment/data/DataRenderer'
import { resolvePath } from '../../environment/environment'
import { EnvironmentRenderer } from '../../environment/EnvironmentRenderer'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { ConcretePath, createConcretePath } from '../path'
import { PrototypicalMovementPath } from '../prototypical/PrototypicalMovementPath'

export interface ConcreteMovementPath extends ConcretePath {
    // delta: { x: number; y: number }
    movement: SVGPathElement
}

function onBegin(
    path: ConcreteMovementPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalMovementPath

    const fromPrototype = resolvePath(environment, pathPrototype.from, null)
    const toPrototype = resolvePath(environment, pathPrototype.to, null)

    const from = renderer.getAllChildRenderers()[fromPrototype.id] as DataRenderer
    const to = renderer.getAllChildRenderers()[toPrototype.id] as DataRenderer

    if (path.movement == null) {
        // The movement path
        path.movement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.movement.classList.add('movement-path')
        path.movement.style.opacity = '0'
        document.getElementById('svg-canvas').append(path.movement)

        const fromBbox = from.element.getBoundingClientRect()
        const toBbox = to.element.getBoundingClientRect()

        // path.delta = {
        //     x: fromBbox.x - toBbox.x,
        //     y: fromBbox.y - toBbox.y,
        // }
        let start = { x: fromBbox.x - toBbox.x, y: fromBbox.y - toBbox.y }
        let end = { x: 0, y: 0 }

        if (renderer.separated) {
            const offset =
                renderer.preRenderer
                    .getAllChildRenderers()
                    [fromPrototype.id].element.getBoundingClientRect().y - fromBbox.y

            console.log('Offsetting...', offset)
            start.y += offset
        }

        let mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }

        // Convex
        if (renderer.separated) {
            const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getArrow(
                start.x,
                start.y,
                end.x,
                end.y,
                {
                    padEnd: 0,
                    padStart: 0,
                }
            )
            path.movement.setAttribute(
                'd',
                `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
            )
        } else {
            let convex = start.x < end.x
            mid.y += (convex ? 1 : -1) * Math.abs(end.x - start.x) * 0.5
            path.movement.setAttribute(
                'd',
                `M ${start.x} ${start.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`
            )
        }
    }
}

function onSeek(
    path: ConcreteMovementPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer,
    t: number
) {
    const pathPrototype = path.prototype as PrototypicalMovementPath

    const toPrototype = resolvePath(environment, pathPrototype.to, null)
    const to = renderer.getAllChildRenderers()[toPrototype.id] as DataRenderer

    const { x, y } = this.movement.getPointAtLength(t * this.movement.getTotalLength())
    to.element.style.transform = `translate(${x}px, ${y}px)`
}

function onEnd(
    path: ConcreteMovementPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalMovementPath

    const toPrototype = resolvePath(environment, pathPrototype.from, null)
    const to = renderer.getAllChildRenderers()[toPrototype.id] as DataRenderer

    to.element.style.transform = `translate(0px, 0px)`
    path.movement?.remove()
}

/**
 *
 * @param from
 * @param to if is an environment state, then moves data to the next free spot
 * @param id
 */
export function createConcreteMovementPath(
    prototype: PrototypicalMovementPath
): ConcreteMovementPath {
    return {
        ...createConcretePath(prototype),

        movement: null,

        onBegin,
        onSeek,
        onEnd,
    }
}
