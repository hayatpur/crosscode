import { resolvePath } from '../../environment/environment'
import { EnvironmentRenderer } from '../../environment/EnvironmentRenderer'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { ConcretePath, createConcretePath } from '../path'
import { PrototypicalCreatePath } from '../prototypical/PrototypicalCreatePath'
import { PrototypicalMovementPath } from '../prototypical/PrototypicalMovementPath'
import { ConcretePlacementPath } from './ConcretePlacementPath'

export interface ConcreteCreatePath extends ConcretePath {}

function onBegin(
    path: ConcretePlacementPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalCreatePath
    const dataPrototype = resolvePath(environment, pathPrototype.data, null)

    renderer.dataRenderers[dataPrototype.id].element.style.opacity = `${0}`
}

function onSeek(
    path: ConcretePlacementPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer,
    t: number
) {
    const pathPrototype = path.prototype as PrototypicalCreatePath
    const dataPrototype = resolvePath(environment, pathPrototype.data, null)

    renderer.dataRenderers[dataPrototype.id].element.style.opacity = `${t}`
}

function onEnd(
    path: ConcretePlacementPath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalCreatePath
    const dataPrototype = resolvePath(environment, pathPrototype.data, null)

    renderer.dataRenderers[dataPrototype.id].element.style.opacity = `1`
}

/**
 *
 * @param from
 * @param to if is an environment state, then moves data to the next free spot
 * @param id
 */
export function createConcreteCreatePath(
    prototype: PrototypicalMovementPath
): ConcreteCreatePath {
    return {
        ...createConcretePath(prototype),

        onBegin,
        onSeek,
        onEnd,
    }
}
