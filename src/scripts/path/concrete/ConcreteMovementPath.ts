import { DataRenderer } from '../../environment/data/DataRenderer'
import { resolvePath } from '../../environment/environment'
import { EnvironmentRenderer } from '../../environment/EnvironmentRenderer'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { remap } from '../../utilities/math'
import { ConcretePath, createConcretePath } from '../path'
import { PrototypicalMovementPath } from '../prototypical/PrototypicalMovementPath'

export interface ConcreteMovementPath extends ConcretePath {
    delta: { x: number; y: number }
}

function onBegin(
    path: ConcreteMovementPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalMovementPath

    const fromPrototype = resolvePath(environment, pathPrototype.from, null)
    const toPrototype = resolvePath(environment, pathPrototype.to, null)

    const from = renderer.getAllChildRenderers()[
        fromPrototype.id
    ] as DataRenderer
    const to = renderer.getAllChildRenderers()[toPrototype.id] as DataRenderer

    if (path.delta == null) {
        const fromBbox = from.element.getBoundingClientRect()
        const toBbox = to.element.getBoundingClientRect()

        path.delta = {
            x: fromBbox.x - toBbox.x,
            y: fromBbox.y - toBbox.y,
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

    to.element.style.transform = `translate(${remap(
        t,
        0,
        1,
        path.delta.x,
        0
    )}px, ${remap(t, 0, 1, path.delta.y, 0)}px)`
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

        delta: null,

        onBegin,
        onSeek,
        onEnd,
    }
}
