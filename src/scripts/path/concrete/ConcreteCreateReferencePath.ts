import { EnvironmentRenderer } from '../../environment/EnvironmentRenderer'
import { PrototypicalEnvironmentState } from '../../environment/EnvironmentState'
import { ConcretePath, createConcretePath } from '../path'
import { PrototypicalCreateReferencePath } from '../prototypical/PrototypicalCreateReferencePath'

export interface ConcreteCreateReferencePath extends ConcretePath {}

function onBegin(
    path: ConcreteCreateReferencePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalCreateReferencePath
}

function onSeek(
    path: ConcreteCreateReferencePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer,
    t: number
) {
    const pathPrototype = path.prototype as PrototypicalCreateReferencePath
}

function onEnd(
    path: ConcreteCreateReferencePath,
    environment: PrototypicalEnvironmentState,
    renderer: EnvironmentRenderer
) {
    const pathPrototype = path.prototype as PrototypicalCreateReferencePath
}

/**
 *
 * @param from
 * @param to if is an environment state, then moves data to the next free spot
 * @param id
 */
export function createConcreteCreateReferencePath(
    prototype: PrototypicalCreateReferencePath
): ConcreteCreateReferencePath {
    return {
        ...createConcretePath(prototype),

        onBegin,
        onSeek,
        onEnd,
    }
}
